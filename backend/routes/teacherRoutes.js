const express = require('express');
const router = express.Router();
const { getStudents, sendMessage, getMessages } = require('../controllers/teacherController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.get('/students', protect, teacher, getStudents);
router.post('/message', protect, teacher, sendMessage);
router.get('/messages/:studentId', protect, teacher, getMessages);

module.exports = router;
