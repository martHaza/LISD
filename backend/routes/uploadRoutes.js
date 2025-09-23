import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";
const router = express.Router();

import { authenticateUser, authorizeRole } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const isAllowedMime = allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');
      if (isAllowedMime) {
        return cb(null, true);
      }
    
      console.error('Rejected file:', file.mimetype, file.originalname);
      cb(new Error('Only images are allowed'));
    }
});

router.post('/upload', authenticateUser, upload.single('image'), (req, res) => {
  const filePath = req.file.path;
  res.json({ success: true, filePath });
});

router.get('/images', authenticateUser, (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Failed to read uploads dir:', err);
      return res.status(500).json({ error: 'Failed to load images' });
    }

    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    res.json({ images: imageFiles });
  });
});

router.get('/image/:filename', /*authenticateUser,*/ (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(filePath);
  });
});

export default router;
