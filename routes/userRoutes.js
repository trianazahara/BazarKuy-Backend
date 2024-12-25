const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const uploadConfig = require('../middlewares/upload');  // Ubah ini

router.use(auth);

// Profile routes
router.post('/profile', uploadConfig.profile.single('image'), userController.updateProfile);
router.get('/profile', userController.getProfile);
router.put('/profile', uploadConfig.profile.single('profileImage'), userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/profile/image', userController.deleteProfileImage);

module.exports = router;