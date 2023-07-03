import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa'
import './App.css';

const App = () => {

  const [images, setImages] = useState(null)
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {

    const gallery = getImagesGallery();
    gallery.then((response) => response.json())
      .then((data) => setImages(data))
      .catch((error) => console.log(error))

  }, [])

  const getImagesGallery = () => {
    return fetch('http://127.0.0.1:5000/api/gallery')
  }

  const uploadImage = (e) => {
    e.preventDefault()

    const form = new FormData();
    form.append('title', title);
    form.append('image', image);

    fetch('http://127.0.0.1:5000/api/gallery/image/upload', {
      method: 'POST',
      body: form,
    }).then(response => response.json())
      .then(data => {
        toast.success(data.message);
        setImages(images => images.concat(data.image))
        setTitle('');
        setImage(null);
        e.target.reset();
      })
      .catch((error) => console.log(error));

  }

  const deleteImage = id => {
    fetch(`http://127.0.0.1:5000/api/gallery/image/${id}/delete`, {
      method: 'DELETE',
    }).then(response => response.json())
      .then(data => {
        toast.success(data.message);
        setImages(images => images.filter(image => image.id !== id))
      })
  }

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className='text-center text-primary'>Project Gallery</h1>
          </div>
        </div>
        <div className="row">
          {
            !!images &&
            images.length > 0 &&
            images.map((img) => {
              return (
                <div className="col-md-4" key={img.id}>
                  <div className="card">
                    <img src={img.image_file} className="card-img-top" alt={img.title} />
                    <div className="card-body">
                      <h5 className="card-title d-flex justify-content-between">
                        {img.title}
                        <span id='deleteImage' onClick={() => deleteImage(img.id)}><FaTrash /></span>
                      </h5>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>

        <div className="row">
          <div className="col-md-12">
            <form onSubmit={uploadImage} className='mx-auto w-50 my-5'>
              <div className="form-group mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input className='form-control' type="text" name="title" id="title" onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="image" className="form-label">Image</label>
                <input className='form-control' type="file" name="image" id="image" onChange={(e) => setImage(e.target.files[0])} />
              </div>
              <button className='btn btn-primary w-100'>Upload</button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

    </>
  )
}

export default App