const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, folderController.getAllFolders);

router.post('/', authenticateToken, folderController.createFolder);

router.get('/:id', authenticateToken, folderController.getFolderById);

router.put('/:id', authenticateToken, folderController.updateFolder);

router.delete('/:id', authenticateToken, folderController.deleteFolder);

module.exports = router;