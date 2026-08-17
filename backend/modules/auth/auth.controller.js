const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const query = require('./auth.query');
const { buildUserPayload } = require('./auth.helpers');

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
}

function setRefreshCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: '/api/auth', // solo se envía a rutas de auth (refresh/logout)
    });
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
        }

        const user = await query.findUserByUsername(username);

        // Mensaje genérico a propósito: no revelar si falló el usuario o la contraseña.
        if (!user || !user.hashed_password) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const passwordMatches = await bcrypt.compare(password, user.hashed_password);
        
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const accessToken = generateAccessToken({
            sub: user.id,
            role: user.role,
            personalInformationId: user.personal_information_id,
        });
        const refreshToken = generateRefreshToken({ sub: user.id });

        setRefreshCookie(res, refreshToken);

        const userPayload = await buildUserPayload(user, query);

        return res.status(200).json({ accessToken, user: userPayload });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
}

async function refresh(req, res) {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({ message: 'No hay sesión activa.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await query.findUserById(decoded.sub);

        if (!user) {
            res.clearCookie('refreshToken', { path: '/api/auth' });
            return res.status(401).json({ message: 'Sesión no válida.' });
        }

        const accessToken = generateAccessToken({
            sub: user.id,
            role: user.role,
            personalInformationId: user.personal_information_id,
        });

        // Rotación: se emite un refresh token nuevo en cada refresh y se invalida el anterior.
        const newRefreshToken = generateRefreshToken({ sub: user.id });
        setRefreshCookie(res, newRefreshToken);

        const userPayload = await buildUserPayload(user, query);

        return res.status(200).json({ accessToken, user: userPayload });
    } catch (error) {
        res.clearCookie('refreshToken', { path: '/api/auth' });
        return res.status(401).json({ message: 'Sesión expirada, inicia sesión nuevamente.' });
    }
}

async function logout(req, res) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.status(200).json({ message: 'Sesión cerrada.' });
}

async function me(req, res) {
    try {
        const user = await query.findUserById(req.user.sub);

        if (!user) {
            return res.status(401).json({ message: 'Sesión no válida.' });
        }

        const userPayload = await buildUserPayload(user, query);
        return res.status(200).json({ user: userPayload });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el usuario.' });
    }
}

module.exports = { login, refresh, logout, me };