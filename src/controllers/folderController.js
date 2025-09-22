const folderService = require('../services/folderService');

class FolderController {
    async getAllFolders(req, res) {
        try {
            const userId = req.user.userId;
            const result = await folderService.getAllFolders(userId);

            res.status(200).json({
                success: true,
                message: 'Folders retrieved successfully',
                folders: result.folders
            });
        } catch (error) {
            console.error('Error in getAllFolders:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get folders'
            });
        }
    }

    async createFolder(req, res) {
        try {
            const userId = req.user.userId;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name is required'
                });
            }

            const result = await folderService.createFolder(userId, name);

            res.status(201).json({
                success: true,
                message: 'Folder created successfully',
                folder: result.folder
            });
        } catch (error) {
            console.error('Error in createFolder:', error);

            if (error.message === 'Folder name is required' ||
                error.message === 'Folder name must be less than 50 characters' ||
                error.message === 'Folder with this name already exists') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create folder'
            });
        }
    }

    async updateFolder(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name is required'
                });
            }

            const result = await folderService.updateFolder(id, userId, name);

            res.status(200).json({
                success: true,
                message: 'Folder updated successfully',
                folder: result.folder
            });
        } catch (error) {
            console.error('Error in updateFolder:', error);

            if (error.message === 'Folder not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }

            if (error.message === 'Folder name is required' ||
                error.message === 'Folder name must be less than 50 characters' ||
                error.message === 'Folder with this name already exists' ||
                error.message === 'Cannot rename default folder') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update folder'
            });
        }
    }

    async deleteFolder(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await folderService.deleteFolder(id, userId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in deleteFolder:', error);

            if (error.message === 'Folder not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }

            if (error.message === 'Cannot delete default folder' ||
                error.message === 'Default folder not found') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to delete folder'
            });
        }
    }

    async getFolderById(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await folderService.getFolderById(id, userId);

            res.status(200).json({
                success: true,
                message: 'Folder retrieved successfully',
                folder: result.folder
            });
        } catch (error) {
            console.error('Error in getFolderById:', error);

            if (error.message === 'Folder not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to get folder'
            });
        }
    }
}

module.exports = new FolderController();