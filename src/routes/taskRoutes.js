const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, taskController.getAllTasks);

router.post('/', authenticateToken, taskController.createTask);

router.get('/:id', authenticateToken, taskController.getTaskById);

router.put('/:id', authenticateToken, taskController.updateTask);

router.patch('/:id/toggle', authenticateToken, taskController.toggleTaskStatus);

router.delete('/:id', authenticateToken, taskController.deleteTask);

module.exports = router;