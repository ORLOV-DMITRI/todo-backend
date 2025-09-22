const taskService = require('../services/taskService');

class TaskController {
    async getAllTasks(req, res) {
        try {
            const userId = req.user.userId;
            const { status } = req.query;

            const result = await taskService.getAllTasks(userId, status);

            res.status(200).json({
                success: true,
                message: 'Tasks retrieved successfully',
                tasks: result.tasks,
                ...(status && { filteredByStatus: status })
            });
        } catch (error) {
            console.error('Error in getAllTasks:', error);

            if (error.message === 'Invalid status. Must be "active" or "completed"') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to get tasks'
            });
        }
    }

    async createTask(req, res) {
        try {
            const userId = req.user.userId;
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Task title is required'
                });
            }

            const result = await taskService.createTask(userId, title, description);

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                task: result.task
            });
        } catch (error) {
            console.error('Error in createTask:', error);

            if (error.message === 'Task title is required' ||
                error.message === 'Task title must be less than 200 characters' ||
                error.message === 'Task description must be less than 1000 characters') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create task'
            });
        }
    }

    async updateTask(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Task title is required'
                });
            }

            const result = await taskService.updateTask(id, userId, title, description);

            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                task: result.task
            });
        } catch (error) {
            console.error('Error in updateTask:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            if (error.message === 'Task title is required' ||
                error.message === 'Task title must be less than 200 characters' ||
                error.message === 'Task description must be less than 1000 characters') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update task'
            });
        }
    }

    async deleteTask(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await taskService.deleteTask(id, userId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in deleteTask:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to delete task'
            });
        }
    }

    async getTaskById(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await taskService.getTaskById(id, userId);

            res.status(200).json({
                success: true,
                message: 'Task retrieved successfully',
                task: result.task
            });
        } catch (error) {
            console.error('Error in getTaskById:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to get task'
            });
        }
    }

    async toggleTaskStatus(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await taskService.toggleTaskStatus(id, userId);

            res.status(200).json({
                success: true,
                message: 'Task status toggled successfully',
                task: result.task,
                previousStatus: result.previousStatus,
                newStatus: result.newStatus
            });
        } catch (error) {
            console.error('Error in toggleTaskStatus:', error);

            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to toggle task status'
            });
        }
    }
}

module.exports = new TaskController();