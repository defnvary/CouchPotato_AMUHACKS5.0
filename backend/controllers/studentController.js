const User = require('../models/User');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const DailyLog = require('../models/DailyLog');
const Progress = require('../models/Progress');
const Message = require('../models/Message');
const { calculateRPS, generateRecoveryPlan, assessRisk } = require('../utils/recoveryEngine');

// @desc    Get Student Dashboard Data (Plan, Stress, Tasks)
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Get Tasks
        const tasks = await Task.find({ student: studentId, status: { $ne: 'Completed' } });

        // 2. Get Today's Log
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        let todayLog = await DailyLog.findOne({
            student: studentId,
            date: { $gte: startOfDay }
        });

        // Default or create if not exists?
        // If no log today, we might return empty plan or ask for input.
        // For functionality, if missing, we use default stress 5, time 2h
        let recoveryPlan = null;

        if (todayLog) {
            recoveryPlan = generateRecoveryPlan(tasks, req.user, todayLog);
        }

        // Get missing subjects count?
        const subjects = await Subject.find({ student: studentId });

        res.json({
            student: req.user,
            subjects,
            tasks,
            todayLog,
            recoveryPlan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report Stress & Available Time (Triggers Planning)
// @route   POST /api/student/log
// @access  Private (Student)
const reportDailyLog = async (req, res) => {
    const { stressLevel, availableTime, notes } = req.body;
    const studentId = req.user._id;

    // Check if log exists for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let log = await DailyLog.findOne({
        student: studentId,
        date: { $gte: startOfDay }
    });

    if (log) {
        log.stressLevel = stressLevel;
        log.availableTime = availableTime;
        log.notes = notes;
        await log.save();
    } else {
        log = await DailyLog.create({
            student: studentId,
            stressLevel,
            availableTime,
            notes
        });
    }

    // Return the new plan immediately
    const tasks = await Task.find({ student: studentId, status: { $ne: 'Completed' } });
    const recoveryPlan = generateRecoveryPlan(tasks, req.user, log);

    res.json({ log, recoveryPlan });
};

// @desc    Add a Task
// @route   POST /api/student/task
// @access  Private
const addTask = async (req, res) => {
    const { subjectId, title, dueDate, type, weightage } = req.body;

    const task = await Task.create({
        student: req.user._id,
        subject: subjectId,
        title,
        dueDate,
        type,
        weightage,
        status: 'Pending'
    });

    res.status(201).json(task);
};

// @desc    Add a Subject
// @route   POST /api/student/subject
// @access  Private
const addSubject = async (req, res) => {
    const { name } = req.body;

    const subject = await Subject.create({
        student: req.user._id,
        name
    });

    res.status(201).json(subject);
};

// @desc    Complete a Task
// @route   PUT /api/student/task/:id/complete
// @access  Private
const completeTask = async (req, res) => {
    const task = await Task.findById(req.params.id).populate('subject');

    if (task && task.student.toString() === req.user._id.toString()) {
        task.status = 'Completed';
        task.completedAt = Date.now();
        await task.save();

        // Track in Progress for analytics
        let progress = await Progress.findOne({ student: req.user._id });
        if (!progress) {
            progress = await Progress.create({ student: req.user._id, completedTasks: [], weeklyStats: [] });
        }

        progress.completedTasks.push({
            task: task._id,
            completedAt: task.completedAt,
            taskSnapshot: {
                title: task.title,
                subject: task.subject?.name || 'Unknown',
                weightage: task.weightage,
                type: task.type
            }
        });
        await progress.save();

        res.json(task);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};

// @desc    Update a Task
// @route   PUT /api/student/task/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, dueDate, type, weightage, subjectId } = req.body;
    const task = await Task.findById(req.params.id);

    if (task && task.student.toString() === req.user._id.toString()) {
        task.title = title || task.title;
        task.dueDate = dueDate || task.dueDate;
        task.type = type || task.type;
        task.weightage = weightage !== undefined ? weightage : task.weightage;
        task.subject = subjectId || task.subject;
        await task.save();
        res.json(task);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};

// @desc    Delete a Task
// @route   DELETE /api/student/task/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task && task.student.toString() === req.user._id.toString()) {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};

// @desc    Update a Subject
// @route   PUT /api/student/subject/:id
// @access  Private
const updateSubject = async (req, res) => {
    const { name } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (subject && subject.student.toString() === req.user._id.toString()) {
        subject.name = name || subject.name;
        await subject.save();
        res.json(subject);
    } else {
        res.status(404);
        throw new Error('Subject not found');
    }
};

// @desc    Delete a Subject
// @route   DELETE /api/student/subject/:id
// @access  Private
const deleteSubject = async (req, res) => {
    const subject = await Subject.findById(req.params.id);

    if (subject && subject.student.toString() === req.user._id.toString()) {
        // Also delete all tasks associated with this subject
        await Task.deleteMany({ subject: subject._id });
        await subject.deleteOne();
        res.json({ message: 'Subject and associated tasks removed' });
    } else {
        res.status(404);
        throw new Error('Subject not found');
    }
};

// @desc    Get Progress Analytics
// @route   GET /api/student/progress
// @access  Private
const getProgress = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get progress data
        let progress = await Progress.findOne({ student: studentId });
        if (!progress) {
            progress = await Progress.create({ student: req.user._id, completedTasks: [], weeklyStats: [] });
        }

        // Get stress logs for trend
        const logs = await DailyLog.find({ student: studentId })
            .sort({ date: -1 })
            .limit(30);

        // Calculate stats
        const last7Days = progress.completedTasks.filter(ct => {
            const daysDiff = (Date.now() - new Date(ct.completedAt)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        const last30Days = progress.completedTasks.filter(ct => {
            const daysDiff = (Date.now() - new Date(ct.completedAt)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        res.json({
            totalCompleted: progress.completedTasks.length,
            last7Days: last7Days.length,
            last30Days: last30Days.length,
            completedTasks: progress.completedTasks.slice(-20).reverse(), // Last 20
            stressTrend: logs.map(l => ({ date: l.date, stressLevel: l.stressLevel, availableTime: l.availableTime }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Break down a task into subtasks (Magic Todo)
// @route   POST /api/student/task/breakdown
// @access  Private
const breakdownTaskEndpoint = async (req, res) => {
    try {
        const { title, spiciness } = req.body;
        const { breakdownTask } = require('../utils/taskBreakdown');

        const breakdown = breakdownTask(title, spiciness || 2);
        res.json(breakdown);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get perspective on current workload (Judge)
// @route   POST /api/student/perspective
// @access  Private
const getPerspective = async (req, res) => {
    try {
        const { stressLevel, availableTime } = req.body;
        const { analyzePerspective } = require('../utils/perspectiveCheck');

        // Get student's pending tasks
        const tasks = await Task.find({
            student: req.user._id,
            status: { $ne: 'Completed' }
        });

        const perspective = analyzePerspective(stressLevel, tasks, availableTime);
        res.json(perspective);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get workload summary
// @route   GET /api/student/workload
// @access  Private
const getWorkload = async (req, res) => {
    try {
        const { calculateDailyWorkload } = require('../utils/timeEstimator');

        const tasks = await Task.find({
            student: req.user._id,
            status: { $ne: 'Completed' }
        });

        const workload = calculateDailyWorkload(tasks);
        res.json(workload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Messages for Student
// @route   GET /api/student/messages
// @access  Private (Student)
const getMessages = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get all messages sent to this student
        const messages = await Message.find({ to: studentId })
            .populate('from', 'name email role')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    reportDailyLog,
    addTask,
    addSubject,
    completeTask,
    updateTask,
    deleteTask,
    updateSubject,
    deleteSubject,
    getProgress,
    breakdownTaskEndpoint,
    getPerspective,
    getWorkload,
    getMessages
};
