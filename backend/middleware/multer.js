import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	if (!file?.mimetype?.startsWith('image/')) {
		return cb(new Error('Only image uploads are allowed'));
	}
	cb(null, true);
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		// Keep request payload under common serverless limits.
		fileSize: 4 * 1024 * 1024,
	},
});