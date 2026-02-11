const mongoose = require('mongoose');

const dailyLogSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    stressLevel: { type: Number, min: 1, max: 10, required: true },
    availableTime: { type: Number, required: true }, // In hours
    notes: { type: String },
}, {
    timestamps: true,
});

// Compound index to ensure one log per student per day
dailyLogSchema.index({ student: 1, date: 1 });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

module.exports = DailyLog;
