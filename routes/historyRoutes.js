const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getApplicationHistory } = require('../controllers/applicationController');
const { getBazarHistory } = require('../controllers/bazarController');

router.use(auth);

// Route for UMKM
router.get('/applications', getApplicationHistory);

// Route for Penyelenggara Bazar
router.get('/bazars', (req, res, next) => {
    console.log('GET /api/history/bazars called');
    next();
  }, getBazarHistory);

module.exports = router;
