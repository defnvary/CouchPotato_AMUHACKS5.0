const User = require('../models/User');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const DailyLog = require('../models/DailyLog');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('🌱 Seeding Demo Data...');

        // Clear existing data
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Task.deleteMany({});
        await DailyLog.deleteMany({});

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Password@123', salt);

        // 1. Create Users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@rebound.edu',
            password: hashedPassword,
            role: 'admin'
        });

        const teacher = await User.create({
            name: 'Prof. Severus',
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

        // 2. Create Subjects (High load to show stress)
        const subjects = await Subject.insertMany([
            { student: student._id, name: 'Advanced Potions', currentGrade: 88, color: '#10B981' }, // Green
            { student: student._id, name: 'Defense Against Dark Arts', currentGrade: 65, color: '#EF4444' }, // Red (Struggling)
            { student: student._id, name: 'Transfiguration', currentGrade: 72, color: '#F59E0B' }, // Yellow
            { student: student._id, name: 'History of Magic', currentGrade: 92, color: '#3B82F6' } // Blue
        ]);

        const [potions, dada, transfiguration, history] = subjects;

        // 3. Create Tasks (The "Crisis" Scenario)
        // High backlog to trigger High Risk
        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

        await Task.insertMany([
            // OVERDUE (The stressors)
            {
                student: student._id,
                subject: dada._id,
                title: 'Essay: Unforgivable Curses',
                dueDate: yesterday, // Overdue
                type: 'Assignment',
                weightage: 20,
                status: 'Missed',
                priorityScore: 95
            },
            {
                student: student._id,
                subject: transfiguration._id,
                title: 'Lab: Vanishing Spells',
                dueDate: yesterday,
                type: 'Lab',
                weightage: 15,
                status: 'Missed',
                priorityScore: 88
            },

            // DUE TOMORROW (The Panic)
            {
                student: student._id,
                subject: potions._id,
                title: 'Final Project: Liquid Luck',
                dueDate: tomorrow,
                type: 'Project',
                weightage: 30, // High impact
                status: 'Pending',
                estimatedTime: 120, // 2 hours
                priorityScore: 92,
                subtasks: [
                    { title: 'Gather ingredients', completed: true, estimatedTime: 30 },
                    { title: 'Brew base', completed: false, estimatedTime: 60 },
                    { title: 'Final stir', completed: false, estimatedTime: 30 }
                ]
            },

            // UPCOMING (The Burden)
            {
                student: student._id,
                subject: history._id,
                title: 'Reading: Goblin Wars',
                dueDate: nextWeek,
                type: 'Reading',
                weightage: 5,
                status: 'Pending',
                priorityScore: 40
            },
            {
                student: student._id,
                subject: dada._id,
                title: 'Practice Duelling',
                dueDate: nextWeek,
                type: 'Practice',
                weightage: 10,
                status: 'Pending',
                priorityScore: 45
            }
        ]);

        // 4. Create Stress Logs (History for Heatmap)
        // Shows increasing stress trend -> triggers Risk Warning
        const stressLogData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            // Stress increases as deadline approaches (1 -> 3 -> 5 -> 7 -> 8 -> 9)
            const stress = Math.min(9, 3 + i);

            stressLogData.push({
                student: student._id,
                date: d,
                stressLevel: stress,
                availableTime: 4
            });
        }
        await DailyLog.insertMany(stressLogData);

        console.log('✅ Demo Data Seeded! Ready for recording.');
    } catch (error) {
        console.error(`❌ Seeding Error: ${error.message}`);
    }
};

module.exports = seedData;
