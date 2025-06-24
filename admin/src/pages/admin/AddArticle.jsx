import React, { useState, useContext } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/Admincontext';
import { DoctorContext } from '../../context/Doctorcontext';
import Spinner from '../../components/Spinner';

const AddArticle = () => {
    const admin = useContext(AdminContext);
    const doctor = useContext(DoctorContext);

    const { token, backendurl } = admin.token ? admin : doctor;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
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
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                toast.success("Article published successfully!");
                setTitle('');
                setContent('');
                setImage(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to publish article.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Write a New Article</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-6">
                    <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">Article Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="A Catchy Title"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="image" className="block text-lg font-medium text-gray-700 mb-2">Cover Image (Optional)</label>
                    <input
                        type="file"
                        id="image"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Article Content</label>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="bg-white"
                        modules={{
                            toolbar: [
                                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                ['link', 'image'],
                                ['clean']
                            ],
                        }}
                    />
                </div>
                <div className="text-right">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? <Spinner /> : 'Publish Article'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddArticle; 