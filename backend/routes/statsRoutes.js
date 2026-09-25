const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/overview', statsController.getOverviewStats);

module.exports = router;
