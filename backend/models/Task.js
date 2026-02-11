const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    type: { type: String, enum: ['Assignment', 'Exam', 'Project', 'Study', 'Quiz', 'Lab', 'Reading', 'Practice', 'Other'], default: 'Assignment' },
    weightage: { type: Number, default: 0 }, // Percent of final grade (0-100)

    // Time estimation
    estimatedTime: { type: Number, default: 60 }, // in minutes

    // Subtasks (Magic Todo)
    subtasks: [{
        title: String,
        completed: { type: Boolean, default: false },
        estimatedTime: Number
    }],

    // Status tracking
    status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
    completedAt: { type: Date },

    // RPS - Calculated fields (can be transient or stored)
    priorityScore: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
