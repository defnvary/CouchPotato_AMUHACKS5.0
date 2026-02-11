const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedTasks: [{
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        taskSnapshot: {
            title: String,
            subject: String,
            weightage: Number,
            type: String
        }
    }],
    weeklyStats: [{
        weekStart: Date,
        tasksCompleted: Number,
        avgStressLevel: Number,
        totalHoursWorked: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
