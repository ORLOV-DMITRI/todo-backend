const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/database');
const folderService = require('./folderService');

class AuthService {
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });
    }

    async register(userData) {
        const { email, password, name } = userData;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await this.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });

        try {
            await folderService.createDefaultFolder(user.id);
        } catch (error) {
            console.error('Warning: Failed to create default folder:', error.message);
        }

        const token = this.generateToken(user);

        return { user, token };
    }

    async login(credentials) {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const userWithoutPassword = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };

        const token = this.generateToken(userWithoutPassword);

        return { user: userWithoutPassword, token };
    }

    async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

module.exports = new AuthService();