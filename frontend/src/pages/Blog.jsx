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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="bg-white p-10 border border-gray-200 max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-900 transition" onClick={() => window.location.reload()}>Reload</button>
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
        <div className="container mx-auto p-4 md:p-10">
            <h1 className="text-4xl font-extrabold text-black text-center mb-3 tracking-tight">Health Hub</h1>
            <p className="text-center text-gray-500 mb-12 text-lg">Insights and advice from our trusted medical experts.</p>

            {(!articles || articles.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="text-6xl mb-4">📰</div>
                    <p className="text-gray-500 text-lg font-medium mb-2">No articles published yet.</p>
                    <p className="text-gray-400">Check back soon for expert health insights!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {articles.map(article => (
                        <Link to={`/blog/${article._id}`} key={article._id} className="bg-white border border-gray-200 p-7 h-full flex flex-col justify-between transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black">
                            <div>
                                <h2 className="text-2xl font-bold text-black mb-2 leading-tight line-clamp-2">{article.title || 'Untitled'}</h2>
                                <div className="text-gray-500 text-sm mb-4">
                                    By Dr. {article.authorName || 'Unknown'} &middot; {article.createdAt ? moment(article.createdAt).format('MMMM Do, YYYY') : 'Unknown date'}
                                </div>
                                <div 
                                    className="text-gray-700 text-base line-clamp-4"
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