//routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/bazar/:bazarId/apply', applicationController.applyToBazar);
router.get('/my-applications', applicationController.getApplications);
router.get('/bazar/:bazarId/applications', applicationController.getApplications);
router.put('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;