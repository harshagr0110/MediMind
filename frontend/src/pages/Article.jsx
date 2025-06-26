import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';
import moment from 'moment';
import { FaUserMd, FaCalendarAlt } from 'react-icons/fa';

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

const Article = () => {
    const { id } = useParams();
    const { backendurl } = useContext(AppContext);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    if (!id) {
        return (
            <div className="text-center p-12 text-red-600 font-bold">
                Invalid article link. No article ID provided.
            </div>
        );
    }

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await axios.get(`${backendurl}/api/articles/${id}`);
                if (data.success) {
                    setArticle(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch article", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id, backendurl]);

    if (loading) return <Spinner />;

    if (!article) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl text-gray-700">Article not found.</h2>
                <p className="text-gray-500">It might have been moved or deleted.</p>
                <Link to="/blog" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {article.image && (
                    <img src={article.image} alt={article.title || 'Article'} className="w-full h-96 object-cover rounded-lg shadow-lg mb-8" />
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">{article.title || 'Untitled'}</h1>
                <div className="flex items-center text-gray-500 mb-8 space-x-6">
                    <div className="flex items-center">
                        <FaUserMd className="mr-2" />
                        <span>By Dr. {article.authorName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        <span>{article.createdAt ? moment(article.createdAt).format('MMMM Do, YYYY') : 'Unknown date'}</span>
                    </div>
                </div>
                <div 
                    className="prose prose-lg max-w-none bg-gray-100 rounded p-4 my-4 overflow-auto"
                    style={{maxHeight: '250px', wordBreak: 'break-word'}}
                    dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
            </div>
        </div>
    );
};

const ArticlePage = (props) => (
    <ErrorBoundary>
        <Article {...props} />
    </ErrorBoundary>
);

export default ArticlePage; 