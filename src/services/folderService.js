const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FolderService {
    async getAllFolders(userId) {
        try {
            const folders = await prisma.folder.findMany({
                where: {
                    userId: userId
                },
                include: {
                    _count: {
                        select: {
                            notes: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            const foldersWithSystemFlag = folders.map(folder => ({
                ...folder,
                isSystem: folder.name === 'Все'
            }));

            return {
                success: true,
                folders: foldersWithSystemFlag
            };
        } catch (error) {
            console.error('Error getting folders:', error);
            throw new Error('Failed to get folders');
        }
    }

    async createFolder(userId, name) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Folder name is required');
            }

            if (name.trim().length > 50) {
                throw new Error('Folder name must be less than 50 characters');
            }

            const trimmedName = name.trim();

            const existingFolder = await prisma.folder.findFirst({
                where: {
                    userId: userId,
                    name: trimmedName
                }
            });

            if (existingFolder) {
                throw new Error('Folder with this name already exists');
            }

            const folder = await prisma.folder.create({
                data: {
                    name: trimmedName,
                    userId: userId
                }
            });

            return {
                success: true,
                folder: folder
            };
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }

    async updateFolder(folderId, userId, name) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Folder name is required');
            }

            if (name.trim().length > 50) {
                throw new Error('Folder name must be less than 50 characters');
            }

            const trimmedName = name.trim();

            const existingFolder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: userId
                }
            });

            if (!existingFolder) {
                throw new Error('Folder not found');
            }

            if (existingFolder.name === 'Все') {
                throw new Error('Cannot rename default folder');
            }

            const duplicateFolder = await prisma.folder.findFirst({
                where: {
                    userId: userId,
                    name: trimmedName,
                    id: {
                        not: folderId
                    }
                }
            });

            if (duplicateFolder) {
                throw new Error('Folder with this name already exists');
            }

            const updatedFolder = await prisma.folder.update({
                where: {
                    id: folderId
                },
                data: {
                    name: trimmedName
                }
            });

            return {
                success: true,
                folder: updatedFolder
            };
        } catch (error) {
            console.error('Error updating folder:', error);
            throw error;
        }
    }

    async deleteFolder(folderId, userId) {
        try {
            const existingFolder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: userId
                }
            });

            if (!existingFolder) {
                throw new Error('Folder not found');
            }

            if (existingFolder.name === 'Все') {
                throw new Error('Cannot delete default folder');
            }

            const defaultFolder = await prisma.folder.findFirst({
                where: {
                    userId: userId,
                    name: 'Все'
                }
            });

            if (!defaultFolder) {
                throw new Error('Default folder not found');
            }

            await prisma.$transaction(async (tx) => {
                await tx.note.updateMany({
                    where: {
                        folderId: folderId
                    },
                    data: {
                        folderId: defaultFolder.id
                    }
                });

                await tx.folder.delete({
                    where: {
                        id: folderId
                    }
                });
            });

            return {
                success: true,
                message: 'Folder deleted successfully, notes moved to default folder'
            };
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        }
    }

    async getFolderById(folderId, userId) {
        try {
            const folder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: userId
                }
            });

            if (!folder) {
                throw new Error('Folder not found');
            }

            return {
                success: true,
                folder: folder
            };
        } catch (error) {
            console.error('Error getting folder:', error);
            throw error;
        }
    }

    async createDefaultFolder(userId) {
        try {
            const existingDefaultFolder = await prisma.folder.findFirst({
                where: {
                    userId: userId,
                    name: 'Все'
                }
            });

            if (existingDefaultFolder) {
                return {
                    success: true,
                    folder: existingDefaultFolder,
                    message: 'Default folder already exists'
                };
            }

            const defaultFolder = await prisma.folder.create({
                data: {
                    name: 'Все',
                    userId: userId
                }
            });

            return {
                success: true,
                folder: defaultFolder,
                message: 'Default folder created successfully'
            };
        } catch (error) {
            console.error('Error creating default folder:', error);
            throw new Error('Failed to create default folder');
        }
    }
}

module.exports = new FolderService();