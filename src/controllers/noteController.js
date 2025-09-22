const noteService = require('../services/noteService');

class NoteController {
    async getAllNotes(req, res) {
        try {
            const userId = req.user.userId;
            const { folderId } = req.query; // Опциональный параметр для фильтрации по папке

            const result = await noteService.getAllNotes(userId, folderId);

            res.status(200).json({
                success: true,
                message: 'Notes retrieved successfully',
                notes: result.notes,
                ...(folderId && { filteredByFolder: folderId })
            });
        } catch (error) {
            console.error('Error in getAllNotes:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get notes'
            });
        }
    }

    async createNote(req, res) {
        try {
            const userId = req.user.userId;
            const { title, content, folderId } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: 'Note content is required'
                });
            }

            if (!folderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Folder ID is required'
                });
            }

            const result = await noteService.createNote(userId, folderId, title, content);

            res.status(201).json({
                success: true,
                message: 'Note created successfully',
                note: result.note
            });
        } catch (error) {
            console.error('Error in createNote:', error);

            if (error.message === 'Note content is required' ||
                error.message === 'Note content must be less than 10000 characters' ||
                error.message === 'Note title must be less than 200 characters' ||
                error.message === 'Folder not found or does not belong to user') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create note'
            });
        }
    }

    async updateNote(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { title, content, folderId } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: 'Note content is required'
                });
            }

            const result = await noteService.updateNote(id, userId, title, content, folderId);

            res.status(200).json({
                success: true,
                message: 'Note updated successfully',
                note: result.note
            });
        } catch (error) {
            console.error('Error in updateNote:', error);

            if (error.message === 'Note not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Note not found'
                });
            }

            if (error.message === 'Note content is required' ||
                error.message === 'Note content must be less than 10000 characters' ||
                error.message === 'Note title must be less than 200 characters' ||
                error.message === 'Folder not found or does not belong to user') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update note'
            });
        }
    }

    async deleteNote(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await noteService.deleteNote(id, userId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Error in deleteNote:', error);

            if (error.message === 'Note not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Note not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to delete note'
            });
        }
    }

    async getNoteById(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await noteService.getNoteById(id, userId);

            res.status(200).json({
                success: true,
                message: 'Note retrieved successfully',
                note: result.note
            });
        } catch (error) {
            console.error('Error in getNoteById:', error);

            if (error.message === 'Note not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Note not found'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to get note'
            });
        }
    }
}

module.exports = new NoteController();