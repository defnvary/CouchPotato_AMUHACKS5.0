const User = require('../models/User');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const DailyLog = require('../models/DailyLog');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Seeding Data...');

        // Clear existing data
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Task.deleteMany({});
        await DailyLog.deleteMany({});

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        // 1. Create Users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@rebound.edu',
            password: hashedPassword,
            role: 'admin'
        });

        const teacher = await User.create({
            name: 'Prof. Albus',
            email: 'teacher@rebound.edu',
            password: hashedPassword,
            role: 'teacher'
        });

        const student = await User.create({
            name: 'Harry Potter',
            email: 'student@rebound.edu',
            password: hashedPassword,
            role: 'student',
            assignedTeacher: teacher._id
        });

        // 2. Create Subjects
        const math = await Subject.create({ student: student._id, name: 'Advanced Calculus', currentGrade: 65 });
        const physics = await Subject.create({ student: student._id, name: 'Quantum Mechanics', currentGrade: 72 });
        const history = await Subject.create({ student: student._id, name: 'History of Magic', currentGrade: 88 });

        // 3. Create Tasks
        // Overdue Task (High Urgency)
        await Task.create({
            student: student._id,
            subject: math._id,
            title: 'Calculus Problem Set 3',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            type: 'Assignment',
            weightage: 15,
            status: 'Missed'
        });

        // Due Tomorrow (High Urgency)
        await Task.create({
            student: student._id,
            subject: physics._id,
            title: 'Lab Report: Wave Function',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
            type: 'Assignment',
            weightage: 20,
            status: 'Pending'
        });

        // Due Next Week (Medium)
        await Task.create({
            student: student._id,
            subject: history._id,
            title: 'Essay: Goblin Rebellions',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            type: 'Assignment',
            weightage: 10,
            status: 'Pending'
        });

        // 4. Create Initial Low Stress Log (Yesterday)
        await DailyLog.create({
            student: student._id,
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            stressLevel: 4,
            availableTime: 3
        });

        console.log('Data Seeded Successfully!');
    } catch (error) {
        console.error(`Seeding Error: ${error.message}`);
    }
};

module.exports = seedData;
