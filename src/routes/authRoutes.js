const express = require('express');
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/google', oauthController.googleAuth);
router.get('/google/callback', oauthController.googleCallback);
router.get('/github', oauthController.githubAuth);
router.get('/github/callback', oauthController.githubCallback);

router.get('/me', authenticateToken, authController.getMe);

module.exports = router;