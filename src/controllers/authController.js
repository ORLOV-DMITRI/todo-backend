const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, password and name are required'
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            const result = await authService.register({ email, password, name });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: result.user,
                token: result.token
            });

        } catch (error) {
            console.error('Register error:', error);

            if (error.message === 'User with this email already exists') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await authService.login({ email, password });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: result.user,
                token: result.token
            });

        } catch (error) {
            console.error('Login error:', error);

            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMe(req, res) {
        try {
            const userId = req.user.userId;
            const user = await authService.getUserById(userId);

            res.status(200).json({
                success: true,
                user: user
            });

        } catch (error) {
            console.error('GetMe error:', error);

            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new AuthController();