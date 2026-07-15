const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

router.post('/:funeralId/announcement', protect, documentController.generateAnnouncement);
router.post('/:funeralId/obituary', protect, documentController.generateObituary);

module.exports = router;
