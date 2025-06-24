import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';
import moment from 'moment';

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
                console.error("Failed to fetch articles", error);
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

            {articles.length === 0 && !loading ? (
                <div className="text-center text-gray-500">
                    <p>No articles published yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <Link to={`/blog/${article._id}`} key={article._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    By Dr. {article.authorName} on {moment(article.createdAt).format('MMMM Do, YYYY')}
                                </p>
                                <div 
                                    className="text-gray-700 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: article.content }} 
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Blog; 