import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String, // Storing as HTML string from a rich text editor
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'authorModel',
        required: function() { return this.authorModel === 'Doctor'; }
    },
    authorModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Doctor'],
    },
    authorName: { // Denormalized field for easier display
        type: String,
        required: true,
    },
    image: {
        type: String, // URL to a cover image for the article
        // No default, not required
    }
}, { timestamps: true });

const articleModel = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default articleModel; 