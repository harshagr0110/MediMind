import express from 'express';
import { createArticle, getArticles, getArticleById } from '../controllers/articleController.js';
import authAll from '../middleware/authAll.js'; // A new middleware to authorize Admins and Doctors
import { upload } from '../middleware/multer.js'; // Re-using your existing multer for image uploads

const articleRouter = express.Router();

// Public routes
articleRouter.get('/', getArticles);
articleRouter.get('/:id', getArticleById);

// Protected route for creating articles (Admins and Doctors only)
articleRouter.post('/', authAll, upload.single('image'), createArticle);

export default articleRouter;