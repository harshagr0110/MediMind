import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import DoctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import articleRouter from './routes/articleRoute.js';
import { createArticle, getArticles, getArticleById } from './controllers/articleController.js';
import authAll from './middleware/authAll.js';
import upload from './middleware/multer.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/admin', adminRouter);
app.use('/api/doctor', DoctorRouter);
app.use('/api/user', userRouter);
app.use('/api/articles', articleRouter);

// Article API routes defined directly as a workaround
app.get('/api/articles', getArticles);
app.get('/api/articles/:id', getArticleById);
app.post('/api/articles', authAll, upload.single('image'), createArticle);

// Move root route here
app.get('/', (req, res) => {
    res.send('api working')
})

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;