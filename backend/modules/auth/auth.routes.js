const express = require('express');
const rateLimit = require('express-rate-limit');

const { login, refresh, logout, me } = require('./auth.controller');
const { verifyAccessToken } = require('./auth.middleware');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Demasiados intentos de inicio de sesión. Intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/auth/login', loginLimiter, login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.get('/auth/me', verifyAccessToken, me);

module.exports = router;