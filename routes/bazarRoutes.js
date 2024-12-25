const express = require('express');
const router = express.Router();
const bazarController = require('../controllers/bazarController');
const auth = require('../middlewares/auth');
const uploadConfig = require('../middlewares/upload'); 

// Public routes
router.get('/ongoing', bazarController.getOngoingBazars);
router.get('/coming-soon', bazarController.getComingSoonBazars);
router.get('/open', bazarController.getOpenBazars);

// Protected routes
router.use(auth);

router.post('/', uploadConfig.bazar.single('image'), bazarController.createBazar);
router.get('/', bazarController.getBazars);
router.get('/:id', bazarController.getBazarById);
router.put('/:id', uploadConfig.bazar.single('image'), bazarController.updateBazar);
router.delete('/:id', bazarController.deleteBazar);

module.exports = router;