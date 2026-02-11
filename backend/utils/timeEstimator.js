// Time Estimation Utility

const defaultTimeEstimates = {
    'Assignment': 90,
    'Quiz': 30,
    'Exam': 120,
    'Project': 180,
    'Lab': 120,
    'Reading': 60,
    'Practice': 45,
    'Other': 60
};

const estimateTaskTime = (task, studentHistory = []) => {
    // Get base estimate from task type
    let estimate = defaultTimeEstimates[task.type] || 60;

    // Adjust based on weightage (higher weightage = more time)
    if (task.weightage) {
        const weightageMultiplier = 1 + (task.weightage / 100);
        estimate = Math.round(estimate * weightageMultiplier);
    }

    // If we have student history for this type, use average
    if (studentHistory.length > 0) {
        const relevantHistory = studentHistory.filter(h => h.type === task.type);
        if (relevantHistory.length >= 3) {
            const avgTime = relevantHistory.reduce((sum, h) => sum + h.timeSpent, 0) / relevantHistory.length;
            estimate = Math.round(avgTime);
        }
    }

    return estimate;
};

const calculateDailyWorkload = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime() && task.status !== 'Completed';
    });

    const totalMinutes = todayTasks.reduce((sum, task) => sum + (task.estimatedTime || 60), 0);

    return {
        taskCount: todayTasks.length,
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        isRealistic: totalMinutes <= 480 // 8 hours max
    };
};

const getWorkloadWarning = (totalHours, availableHours) => {
    if (totalHours > availableHours * 1.5) {
        return {
            level: 'critical',
            message: `You have ${totalHours}h of work but only ${availableHours}h available. This is unrealistic. Consider prioritizing or requesting extensions.`
        };
    } else if (totalHours > availableHours) {
        return {
            level: 'warning',
            message: `You have ${totalHours}h of work and ${availableHours}h available. This is tight. Focus on high-priority tasks.`
        };
    } else if (totalHours > availableHours * 0.8) {
        return {
            level: 'caution',
            message: `You have ${totalHours}h of work and ${availableHours}h available. Manageable, but stay focused.`
        };
    }

    return {
        level: 'good',
        message: `You have ${totalHours}h of work and ${availableHours}h available. You've got this!`
    };
};

module.exports = {
    estimateTaskTime,
    calculateDailyWorkload,
    getWorkloadWarning
};
