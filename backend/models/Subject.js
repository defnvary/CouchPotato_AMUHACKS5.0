const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    currentGrade: { type: Number, default: 0 }, // Optional: for tracking progress
}, {
    timestamps: true,
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
