import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';
import moment from 'moment';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Blog = () => {
    const { backendurl } = useContext(AppContext);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data } = await axios.get(`${backendurl}/api/articles`);
                if (data.success) {
                    setArticles(data.data);
                }
            } catch (error) {
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [backendurl]);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Health Hub</h1>
            <p className="text-center text-gray-600 mb-12">Insights and advice from our trusted medical experts.</p>

            {(!articles || articles.length === 0) ? (
                <div className="text-center text-gray-500">
                    <p>No articles published yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <Link to={`/blog/${article._id}`} key={article._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                            <img src={article.image || ''} alt={article.title || 'Article'} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title || 'Untitled'}</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    By Dr. {article.authorName || 'Unknown'} on {article.createdAt ? moment(article.createdAt).format('MMMM Do, YYYY') : 'Unknown date'}
                                </p>
                                <div 
                                    className="text-gray-700 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: article.content || '' }} 
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const BlogPage = () => (
  <ErrorBoundary>
    <Blog />
  </ErrorBoundary>
);

export default BlogPage; 