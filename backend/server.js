import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import DoctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit'; // Disabled rate limiting for development
import articleRouter from './routes/articleRoute.js';
import { createArticle, getArticles, getArticleById } from './controllers/articleController.js';
import authAll from './middleware/authAll.js';
import { upload } from './middleware/multer.js';

const app = express();
const port = 4000;

// CORS configuration
app.use(cors({
  origin: [
    'https://medimind-frontend-three.vercel.app',
    'https://medimind-admin-green.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

connectDB();
connectCloudinary();

app.use(express.json());
app.use(helmet());
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Disabled rate limiting for development

app.use('/api/admin', adminRouter);
app.use('/api/doctor', DoctorRouter);
app.use('/api/user', userRouter);
app.use('/api/articles', articleRouter);

// Move root route here
app.get('/', (req, res) => {
    res.send('api working')
})

console.log('JWT_SECRET:', process.env.JWT_SECRET);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR HANDLER] Error:', err.stack || err);
    console.error('[GLOBAL ERROR HANDLER] Request:', req.method, req.originalUrl, '| Headers:', req.headers, '| Body:', req.body, '| User:', req.user);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;