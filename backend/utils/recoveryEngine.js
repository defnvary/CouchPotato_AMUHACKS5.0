const { differenceInCalendarDays, parseISO } = require('date-fns');

/**
 * Calculates Recovery Priority Score (RPS) for a task
 * Formula: RPS = (W * 0.35) + (D * 0.30) + (B * 0.20) + (S * 0.15)
 */
const calculateRPS = (task, subjectBacklogCount, studentStressLevel) => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);

    // 1. Weightage Impact (W) - Normalized 0-100
    // Assuming task.weightage is 0-100 already
    const W = task.weightage || 0;

    // 2. Deadline Urgency (D)
    // 100 / (DaysRemaining + 1). Caps at 100.
    const daysRemaining = differenceInCalendarDays(dueDate, today);
    let D = 0;
    if (daysRemaining < 0) {
        D = 100; // Overdue is max urgency
    } else {
        D = Math.min(100, 100 / (daysRemaining + 1));
    }

    // 3. Backlog Depth (B)
    // 1 task = 10, 5+ tasks = 50, max 100
    // We use subjectBacklogCount from the context
    let B = Math.min(100, subjectBacklogCount * 10);

    // 4. Student Comfort Flip (S)
    // (10 - Stress) * 10
    // If stress is high (e.g. 9), Comfort is low (10), so we prioritize urgency over comfort?
    // Wait, specification says: We prioritize tasks the student is *more comfortable* with to build momentum
    // The formula (10 - Stress) * 10 means:
    // Low Stress (1) -> S = 90. High Stress (9) -> S = 10.
    // If S is high, it ADDS to RPS. 
    // This seems to mean: When stress is LOW, we prioritize comfortable tasks?
    // Actually, usually when stress is HIGH we want "quick wins" (high comfort).
    // Let's stick to the Spec Formula: (10 - Discomfort) * 10.
    // Let's assume 'studentStressLevel' IS 'Discomfort'.
    const S = (10 - studentStressLevel) * 10;

    const RPS = (W * 0.35) + (D * 0.30) + (B * 0.20) + (S * 0.15);
    return Math.round(RPS);
};

/**
 * Determines Allowable Workload based on Stress
 */
const getStressAdjustment = (stressLevel, availableTimeHours) => {
    let factor = 1.0;
    let strategy = "Full Acceleration";

    if (stressLevel <= 3) {
        factor = 1.0;
        strategy = "Full Acceleration: Tackle high-weight, hard tasks.";
    } else if (stressLevel <= 6) {
        factor = 0.8;
        strategy = "Balanced Recovery: Mix of hard and easy tasks.";
    } else if (stressLevel <= 8) {
        factor = 0.5;
        strategy = "Critical Stabilize: Only high-urgency tasks or quick wins.";
    } else {
        factor = 0.2;
        strategy = "Emergency Halt: Just one small task to maintain habit.";
    }

    const allowedHours = availableTimeHours * factor;
    return { factor, strategy, allowedHours };
};

/**
 * Detect Early Warning Risk
 */
const assessRisk = (studentData) => {
    // studentData: { stressHistory, missedTasksCount, overdueTasksCount }
    const { stressHistory, missedTasksCount, overdueTasksCount, backlogDepthDays } = studentData;

    const currentStress = stressHistory[stressHistory.length - 1] || 0;

    // Check for critical
    if ((currentStress > 8) && (missedTasksCount > 5 || backlogDepthDays > 7)) {
        return 'Critical';
    }

    // Check for High
    if (missedTasksCount >= 3 || currentStress > 7) {
        return 'High';
    }

    // Check for Medium
    if (missedTasksCount >= 1 || (currentStress >= 5 && currentStress <= 7)) {
        return 'Medium';
    }

    return 'Low';
};

/**
 * Main Engine Function
 * Takes tasks, student profile, logs and returns Optimized Plan
 */
const generateRecoveryPlan = (tasks, studentProfile, dailyLog) => {
    const stress = dailyLog.stressLevel;
    const available = dailyLog.availableTime;

    // 1. Calculate RPS for all pending tasks
    // We need to group tasks by subject to get backlog counts
    const subjectCounts = {};
    tasks.forEach(t => {
        if (!subjectCounts[t.subject]) subjectCounts[t.subject] = 0;
        if (t.status === 'Pending' || t.status === 'Missed') subjectCounts[t.subject]++;
    });

    const scoredTasks = tasks.map(t => {
        const backlog = subjectCounts[t.subject] || 0;
        const rps = calculateRPS(t, backlog, stress);
        return { ...t.toObject(), rps };
    });

    // 2. Sort by RPS Descending
    scoredTasks.sort((a, b) => b.rps - a.rps);

    // 3. Apply Time Boxing (Knapsack-like or simple greedy)
    const { allowedHours, strategy } = getStressAdjustment(stress, available);

    let plannedHours = 0;
    const recommendedTasks = [];

    for (const task of scoredTasks) {
        // Estimate task duration (simplified: 1 hour default if not specified)
        // In a real app we'd have estimatedTime. Let's assume 1 hr for now.
        const taskDuration = 1.0;

        if (plannedHours + taskDuration <= allowedHours) {
            recommendedTasks.push(task);
            plannedHours += taskDuration;
        }
    }

    // If Emergency Halt (Stress > 9), ensure at least 1 small task if list empty?
    if (stress >= 9 && recommendedTasks.length === 0 && scoredTasks.length > 0) {
        recommendedTasks.push(scoredTasks[0]); // Just one
    }

    return {
        strategy,
        allowedHours,
        recommendedTasks,
        allTasksScored: scoredTasks // For full view
    };
};

module.exports = { calculateRPS, getStressAdjustment, assessRisk, generateRecoveryPlan };
