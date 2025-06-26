import express from 'express';
import { createArticle, getArticles, getArticleById } from '../controllers/articleController.js';
import adminAuth from '../middleware/authAdmin.js';
import { upload } from '../middleware/multer.js'; // Re-using your existing multer for image uploads
import articleModel from '../models/articleModel.js';

const articleRouter = express.Router();

// Public routes
articleRouter.get('/', getArticles);
articleRouter.get('/:id', getArticleById);

// Protected route for creating articles (Admin only)
articleRouter.post('/', adminAuth, upload.single('image'), createArticle);

// Add for admin panel CRUD
articleRouter.post('/article', adminAuth, upload.single('image'), createArticle);
articleRouter.delete('/article/:id', adminAuth, async (req, res) => {
  try {
    const article = await articleModel.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, message: 'Article deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete article.' });
  }
});

export default articleRouter;