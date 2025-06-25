import express from 'express';
import { createArticle, getArticles, getArticleById } from '../controllers/articleController.js';
import authAll from '../middleware/authAll.js'; // A new middleware to authorize Admins and Doctors
import { upload } from '../middleware/multer.js'; // Re-using your existing multer for image uploads
import articleModel from '../models/articleModel.js';

const articleRouter = express.Router();

// Public routes
articleRouter.get('/', getArticles);
articleRouter.get('/:id', getArticleById);

// Protected route for creating articles (Admins and Doctors only)
articleRouter.post('/', authAll, upload.single('image'), createArticle);

// Add for admin panel CRUD
articleRouter.post('/article', authAll, upload.single('image'), createArticle);
articleRouter.delete('/article/:id', authAll, async (req, res) => {
  try {
    const article = await articleModel.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, message: 'Article deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete article.' });
  }
});

export default articleRouter;