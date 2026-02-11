const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 Token received:', token.substring(0, 20) + '...');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token decoded, user ID:', decoded.id);

            // Attach user to request, exclude password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error('❌ User not found in database for ID:', decoded.id);
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
            next();
        } catch (error) {
            console.error('❌ Auth error:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        console.error('❌ No token provided');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const teacher = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a teacher');
    }
};

module.exports = { protect, admin, teacher };
