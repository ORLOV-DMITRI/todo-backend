const prisma = require('../utils/database');

class TaskService {
    async getAllTasks(userId, status = null) {
        try {
            const whereCondition = { userId };

            if (status) {
                if (status !== 'active' && status !== 'completed') {
                    throw new Error('Invalid status. Must be "active" or "completed"');
                }
                whereCondition.completed = status === 'completed';
            }

            const tasks = await prisma.task.findMany({
                where: whereCondition,
                orderBy: [
                    { completed: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            return {
                success: true,
                tasks: tasks
            };
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    }

    async createTask(userId, title, description = '') {
        try {
            if (!title || title.trim().length === 0) {
                throw new Error('Task title is required');
            }

            if (title.trim().length > 200) {
                throw new Error('Task title must be less than 200 characters');
            }

            if (description && description.length > 1000) {
                throw new Error('Task description must be less than 1000 characters');
            }

            const task = await prisma.task.create({
                data: {
                    title: title.trim(),
                    description: description ? description.trim() : null,
                    completed: false,
                    userId: userId
                }
            });

            return {
                success: true,
                task: task
            };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async updateTask(taskId, userId, title, description = '') {
        try {
            if (!title || title.trim().length === 0) {
                throw new Error('Task title is required');
            }

            if (title.trim().length > 200) {
                throw new Error('Task title must be less than 200 characters');
            }

            if (description && description.length > 1000) {
                throw new Error('Task description must be less than 1000 characters');
            }

            const existingTask = await prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            });

            if (!existingTask) {
                throw new Error('Task not found');
            }

            const updatedTask = await prisma.task.update({
                where: {
                    id: taskId
                },
                data: {
                    title: title.trim(),
                    description: description ? description.trim() : null
                }
            });

            return {
                success: true,
                task: updatedTask
            };
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(taskId, userId) {
        try {
            const existingTask = await prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            });

            if (!existingTask) {
                throw new Error('Task not found');
            }

            await prisma.task.delete({
                where: {
                    id: taskId
                }
            });

            return {
                success: true,
                message: 'Task deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    async getTaskById(taskId, userId) {
        try {
            const task = await prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            });

            if (!task) {
                throw new Error('Task not found');
            }

            return {
                success: true,
                task: task
            };
        } catch (error) {
            console.error('Error getting task:', error);
            throw error;
        }
    }

    async toggleTaskStatus(taskId, userId) {
        try {
            const existingTask = await prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            });

            if (!existingTask) {
                throw new Error('Task not found');
            }

            const newCompleted = !existingTask.completed;
            const previousStatus = existingTask.completed ? 'completed' : 'active';
            const newStatus = newCompleted ? 'completed' : 'active';

            const updatedTask = await prisma.task.update({
                where: {
                    id: taskId
                },
                data: {
                    completed: newCompleted
                }
            });

            return {
                success: true,
                task: updatedTask,
                previousStatus: previousStatus,
                newStatus: newStatus
            };
        } catch (error) {
            console.error('Error toggling task status:', error);
            throw error;
        }
    }

    async getActiveTasks(userId) {
        return this.getAllTasks(userId, 'active');
    }

    async getCompletedTasks(userId) {
        return this.getAllTasks(userId, 'completed');
    }
}

module.exports = new TaskService();