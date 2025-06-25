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
import { upload } from './middleware/multer.js';

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://medimind-admin-green.vercel.app',
    'https://medimind-frontend-three.vercel.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

connectDB();
connectCloudinary();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/admin', adminRouter);
app.use('/api/doctor', DoctorRouter);
app.use('/api/user', userRouter);
app.use('/api/articles', articleRouter);

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