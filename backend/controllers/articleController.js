import articleModel from '../models/articleModel.js';
import { v2 as cloudinary } from 'cloudinary';

// CREATE a new article
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;
        const { id: authorId, model: authorModel, name: authorName } = req.user; // From auth middleware

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        const newArticleData = {
            title,
            content,
            author: authorId,
            authorModel,
            authorName,
        };

        if (req.file) {
             const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
                stream.end(req.file.buffer);
            });
            newArticleData.image = result.secure_url;
        }

        const article = new articleModel(newArticleData);
        await article.save();

        res.status(201).json({ success: true, message: 'Article published successfully!', data: article });
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ success: false, message: 'Failed to create article.' });
    }
};

// GET all articles (for public view)
const getArticles = async (req, res) => {
    try {
        const articles = await articleModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch articles.' });
    }
};

// GET a single article by ID
const getArticleById = async (req, res) => {
    try {
        const article = await articleModel.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found.' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error("Error fetching article by ID:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch article.' });
    }
};

export { createArticle, getArticles, getArticleById }; 