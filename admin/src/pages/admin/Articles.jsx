import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';

const customModalStyles = {
  overlay: { backgroundColor: 'rgba(0,0,0,0.3)' },
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    borderRadius: 0, padding: '2rem', maxWidth: 600, width: '90%',
    boxShadow: '0 2px 16px rgba(0,0,0,0.15)', border: '1px solid #eee',
    background: '#fff',
  },
};
Modal.setAppElement('#root');

const Articles = () => {
  const { aToken } = useContext(AdminContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${backendUrl}/api/articles/`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setArticles(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line
  }, [aToken]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    setDeletingId(id);
    try {
      await axios.delete('https://medimind-backend.vercel.app/api/articles/article/' + id, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      await fetchArticles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="p-2 sm:p-8 md:p-12 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-10 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black">Articles</h1>
        <button
          onClick={() => navigate('/add-article')}
          className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 font-bold hover:bg-gray-800 transition shadow-none border border-black"
        >
          Add Article
        </button>
      </div>
      <div className="bg-white border border-gray-200 shadow p-2 sm:p-6 rounded-none">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center text-sm sm:text-base">{error}</div>
        ) : (
          <>
            {/* Card layout for mobile */}
            <div className="block md:hidden space-y-4">
              {articles.map(article => (
                <div key={article._id} className="border border-gray-200 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-black text-lg">{article.title}</span>
                    <span className="text-gray-500 text-xs">{article.authorName || 'Admin'}</span>
                  </div>
                  <div className="text-gray-700 text-sm mb-2">{article.content?.replace(/<[^>]+>/g, '').slice(0, 80)}...</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleView(article)}
                      className="border border-black text-black px-4 py-2 font-semibold hover:bg-gray-100 transition shadow-none flex-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      disabled={deletingId === article._id}
                      className="border border-red-400 text-red-500 px-4 py-2 font-semibold hover:bg-red-50 transition disabled:opacity-60 shadow-none flex-1"
                    >
                      {deletingId === article._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Table layout for md+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                    <th className="py-3 px-4 font-bold border-r border-gray-200">Title</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-200">Author</th>
                    <th className="py-3 px-4 font-bold border-r border-gray-200">Preview</th>
                    <th className="py-3 px-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-black border-r border-gray-100">{article.title}</td>
                      <td className="py-3 px-4 text-gray-700 border-r border-gray-100">{article.authorName || 'Admin'}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate border-r border-gray-100">{article.content?.replace(/<[^>]+>/g, '').slice(0, 80)}...</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleView(article)}
                          className="border border-black text-black px-4 py-2 font-semibold hover:bg-gray-100 transition shadow-none"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          disabled={deletingId === article._id}
                          className="border border-red-400 text-red-500 px-4 py-2 font-semibold hover:bg-red-50 transition disabled:opacity-60 shadow-none"
                        >
                          {deletingId === article._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Article Details"
      >
        {selectedArticle && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-black">{selectedArticle.title}</h2>
            <div className="text-gray-600 mb-2">By {selectedArticle.authorName || 'Admin'}</div>
            <div className="text-gray-500 mb-4">{selectedArticle.createdAt ? new Date(selectedArticle.createdAt).toLocaleDateString() : ''}</div>
            <div className="prose max-w-none bg-gray-100 border border-gray-200 p-4 my-4 overflow-auto" style={{maxHeight: '250px', wordBreak: 'break-word', borderRadius: 0}} dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            <button onClick={closeModal} className="mt-6 bg-black text-white px-6 py-2 font-bold hover:bg-gray-800 transition border border-black" style={{borderRadius: 0}}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Articles;