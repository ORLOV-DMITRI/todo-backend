const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NoteService {
    generateTitleFromContent(content) {
        if (!content || content.trim().length === 0) {
            const date = new Date().toLocaleDateString('ru-RU');
            return `Заметка от ${date}`;
        }

        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        const titleWords = words.slice(0, 5).join(' ');

        if (titleWords.length > 50) {
            return titleWords.substring(0, 47) + '...';
        }

        return titleWords;
    }

    async getAllNotes(userId, folderId = null) {
        try {
            const whereCondition = { userId };

            if (folderId) {
                whereCondition.folderId = folderId;
            }

            const notes = await prisma.note.findMany({
                where: whereCondition,
                include: {
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });

            return {
                success: true,
                notes: notes
            };
        } catch (error) {
            console.error('Error getting notes:', error);
            throw new Error('Failed to get notes');
        }
    }

    async createNote(userId, folderId, title, content) {
        try {
            if (!content || content.trim().length === 0) {
                throw new Error('Note content is required');
            }

            if (content.trim().length > 10000) {
                throw new Error('Note content must be less than 10000 characters');
            }

            const folder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: userId
                }
            });

            if (!folder) {
                throw new Error('Folder not found or does not belong to user');
            }

            let noteTitle = title;
            if (!title || title.trim().length === 0) {
                noteTitle = this.generateTitleFromContent(content);
            } else {
                noteTitle = title.trim();
                if (noteTitle.length > 200) {
                    throw new Error('Note title must be less than 200 characters');
                }
            }

            const note = await prisma.note.create({
                data: {
                    title: noteTitle,
                    content: content.trim(),
                    folderId: folderId,
                    userId: userId
                },
                include: {
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return {
                success: true,
                note: note
            };
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    }

    async updateNote(noteId, userId, title, content, folderId) {
        try {
            if (!content || content.trim().length === 0) {
                throw new Error('Note content is required');
            }

            if (content.trim().length > 10000) {
                throw new Error('Note content must be less than 10000 characters');
            }

            const existingNote = await prisma.note.findFirst({
                where: {
                    id: noteId,
                    userId: userId
                }
            });

            if (!existingNote) {
                throw new Error('Note not found');
            }

            if (folderId && folderId !== existingNote.folderId) {
                const folder = await prisma.folder.findFirst({
                    where: {
                        id: folderId,
                        userId: userId
                    }
                });

                if (!folder) {
                    throw new Error('Folder not found or does not belong to user');
                }
            }

            let noteTitle = title;
            if (!title || title.trim().length === 0) {
                noteTitle = this.generateTitleFromContent(content);
            } else {
                noteTitle = title.trim();
                if (noteTitle.length > 200) {
                    throw new Error('Note title must be less than 200 characters');
                }
            }

            const updatedNote = await prisma.note.update({
                where: {
                    id: noteId
                },
                data: {
                    title: noteTitle,
                    content: content.trim(),
                    folderId: folderId || existingNote.folderId
                },
                include: {
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return {
                success: true,
                note: updatedNote
            };
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    async deleteNote(noteId, userId) {
        try {
            const existingNote = await prisma.note.findFirst({
                where: {
                    id: noteId,
                    userId: userId
                }
            });

            if (!existingNote) {
                throw new Error('Note not found');
            }

            await prisma.note.delete({
                where: {
                    id: noteId
                }
            });

            return {
                success: true,
                message: 'Note deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    async getNoteById(noteId, userId) {
        try {
            const note = await prisma.note.findFirst({
                where: {
                    id: noteId,
                    userId: userId
                },
                include: {
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!note) {
                throw new Error('Note not found');
            }

            return {
                success: true,
                note: note
            };
        } catch (error) {
            console.error('Error getting note:', error);
            throw error;
        }
    }

    async getNotesByFolder(userId, folderId) {
        return this.getAllNotes(userId, folderId);
    }
}

module.exports = new NoteService();