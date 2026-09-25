const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.get('/verify-invite/:token', authController.verifyInviteToken);
router.post('/set-password', authController.setPassword);

module.exports = router;
