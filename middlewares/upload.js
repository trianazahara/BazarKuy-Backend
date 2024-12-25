const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = {
 profile: multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, 'uploads/profiles/');
   },
   filename: function (req, file, cb) {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
     cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
   }
 }),
 bazar: multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, 'uploads/bazars/');
   },
   filename: function (req, file, cb) {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
     cb(null, 'bazar-' + uniqueSuffix + path.extname(file.originalname));
   }
 })
};

// File filter
const fileFilter = (req, file, cb) => {
 if (file.mimetype.startsWith('image/')) {
   cb(null, true);
 } else {
   cb(new Error('Not an image! Please upload an image.'), false);
 }
};

// Upload configurations
const uploadConfig = {
 profile: multer({
   storage: storage.profile,
   fileFilter: fileFilter,
   limits: {
     fileSize: 5 * 1024 * 1024 // 5MB limit
   }
 }),
 bazar: multer({
   storage: storage.bazar,
   fileFilter: fileFilter,
   limits: {
     fileSize: 5 * 1024 * 1024 // 5MB limit
   }
 })
};

module.exports = uploadConfig;