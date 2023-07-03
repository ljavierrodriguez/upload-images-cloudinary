import os
import cloudinary
import cloudinary.uploader
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from models import db
from models.gallery import ImageGallery
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['ENV'] = 'development'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')

db.init_app(app)
Migrate(app, db)
CORS(app)

cloudinary.config( 
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.getenv('CLOUDINARY_API_KEY'), 
  api_secret = os.getenv('CLOUDINARY_API_SECRET'), 
)

@app.route('/api/gallery', methods=['GET'])
def list_gallery_images():
    
    images = ImageGallery.query.filter_by(active=True).all()
    images = list(map(lambda image: image.serialize(), images))
    
    return jsonify(images), 200

@app.route('/api/gallery/image/upload', methods=['POST'])
def upload_image():
    
    title = request.form['title']
    image = None
    #print(title)
    #print(image)
    
    if not title: return jsonify({"message": "Title is required!"}), 400
    if not 'image' in request.files: 
        return jsonify({"message": "Image is required!"}), 400
    else: 
        image = request.files['image']
        
    response = cloudinary.uploader.upload(image, folder="gallery_project")
    
    if response:
        
        imgGallery = ImageGallery()
        imgGallery.title = title
        imgGallery.image_file = response['secure_url']
        imgGallery.public_id = response['public_id']
        imgGallery.active = True
        imgGallery.save()
    
    return jsonify({ "image": imgGallery.serialize(), "message": "Image uploaded successfully"}), 201

@app.route('/api/gallery/image/<int:id>/delete', methods=['DELETE'])
def delete_image(id):
    image = ImageGallery.query.get(id)
    
    if not image: return jsonify({ "message": "Image not found"}), 400
    
    cloudinary.uploader.destroy(image.public_id)
    
    image.delete()
    
    return jsonify({ "message": "Image deleted!"}), 200



if __name__ == '__main__':
    app.run()