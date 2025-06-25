import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';

const Articles = () => {
  const { aToken } = useContext(AdminContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/article/', {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setArticles(data.articles || []);
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
      await axios.delete(`/api/article/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      await fetchArticles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Articles</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Add Article</button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-700 border-b">
                <th className="py-2">Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article._id} className="border-b hover:bg-blue-50">
                  <td className="py-2 font-semibold">{article.title}</td>
                  <td>{article.author}</td>
                  <td>{article.date}</td>
                  <td>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2">Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg" onClick={() => handleDelete(article._id)} disabled={deletingId === article._id}>{deletingId === article._id ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Articles; 