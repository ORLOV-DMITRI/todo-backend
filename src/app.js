const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

console.log('🔄 Loading OAuth service...');
try {
    require('./services/oauthService');
    console.log('✅ OAuth service loaded successfully');
} catch (error) {
    console.error('❌ Error loading OAuth service:', error.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://todo-frontend-tau-six.vercel.app',
        'https://todo.dmitri-server.ru'
    ],
    credentials: true
}));

app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Todo App Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    const folderRoutes = require('./routes/folderRoutes');
    app.use('/api/folders', folderRoutes);
} catch (error) {
    console.error('❌ Error loading folder routes:', error.message);
}

try {
    const noteRoutes = require('./routes/noteRoutes');
    app.use('/api/notes', noteRoutes);
} catch (error) {
    console.error('❌ Error loading note routes:', error.message);
}

try {
    const taskRoutes = require('./routes/taskRoutes');
    app.use('/api/tasks', taskRoutes);
} catch (error) {
    console.error('❌ Error loading task routes:', error.message);
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
});

module.exports = app;