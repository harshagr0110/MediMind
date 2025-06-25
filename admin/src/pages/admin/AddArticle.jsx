import React, { useState, useContext } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';
import { FaNewspaper, FaImage } from 'react-icons/fa';

const AddArticle = () => {
    const { aToken, backendurl } = useContext(AdminContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || content === '<p><br></p>') {
            return toast.error("Title and content are required.");
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const { data } = await axios.post(`${backendurl}/api/articles`, formData, {
                headers: {
                    'Authorization': `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                toast.success("Article published successfully!");
                setTitle('');
                setContent('');
                setImage(null);
                setImagePreview(null);
                if(document.getElementById('image-upload')) {
                    document.getElementById('image-upload').value = null;
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to publish article.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="p-4 md:p-10 bg-gradient-to-br from-blue-50 to-white min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 drop-shadow-sm">
                        <FaNewspaper className="text-blue-500" />
                        Write a New Article
                    </h1>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border border-blue-100">
                        <FaImage className="text-blue-400 mr-2" />
                        <span className="font-semibold text-gray-700">Article Panel</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl border border-blue-100 space-y-10">
                    <div>
                        <label htmlFor="title" className="block text-base font-semibold text-gray-700 mb-2">Article Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg"
                            placeholder="e.g., 10 Tips for a Healthy Heart"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Cover Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-6 pb-8 border-2 border-blue-200 border-dashed rounded-2xl bg-blue-50">
                            <div className="space-y-2 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-44 w-auto rounded-lg object-cover shadow"/>
                                ) : (
                                    <FaImage className="mx-auto h-14 w-14 text-blue-300" />
                                )}
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1.5 border border-blue-100 shadow-sm">
                                        <span>Upload an image</span>
                                        <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Required for a better look</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Article Content</label>
                        <div className="prose max-w-none">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={quillModules}
                                className="mt-1 bg-white rounded-xl border border-blue-100 shadow"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition text-lg disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? <><Spinner sm /><span>Publishing...</span></> : 'Publish Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArticle;