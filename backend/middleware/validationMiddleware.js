const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation Rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const taskValidation = [
    body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }).withMessage('Title too long'),
    body('dueDate').isISO8601().withMessage('Invalid date format'),
    body('type').optional().isIn(['Assignment', 'Exam', 'Project', 'Study']).withMessage('Invalid task type'),
    body('weightage').isInt({ min: 1, max: 100 }).withMessage('Weightage must be between 1 and 100'),
    body('subjectId').notEmpty().withMessage('Subject is required'),
    validate
];

const subjectValidation = [
    body('name').trim().notEmpty().withMessage('Subject name is required').isLength({ max: 100 }).withMessage('Name too long'),
    validate
];

const stressLogValidation = [
    body('stressLevel').isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
    body('availableTime').isFloat({ min: 0, max: 24 }).withMessage('Available time must be between 0 and 24 hours'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    taskValidation,
    subjectValidation,
    stressLogValidation
};
