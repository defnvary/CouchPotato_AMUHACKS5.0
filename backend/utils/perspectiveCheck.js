// Perspective Check Utility - Judge feature

const analyzePerspective = (stressLevel, tasks, availableTime) => {
    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    const totalEstimatedTime = pendingTasks.reduce((sum, t) => sum + (t.estimatedTime || 60), 0) / 60; // in hours

    // Calculate urgency
    const urgentTasks = pendingTasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const now = new Date();
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
        return hoursUntilDue <= 24;
    });

    const highPriorityTasks = pendingTasks.filter(t => t.weightage >= 20);

    // Generate perspective
    let analysis = {
        situation: '',
        reality: '',
        suggestions: [],
        encouragement: '',
        priority: 'normal'
    };

    // Assess situation
    if (stressLevel >= 8 && urgentTasks.length > 3) {
        analysis.priority = 'critical';
        analysis.situation = `You're feeling very stressed (${stressLevel}/10) with ${urgentTasks.length} urgent tasks.`;
        analysis.reality = `This is a genuinely challenging situation. Your stress is valid.`;
        analysis.suggestions = [
            `Identify the 1-2 most critical tasks that MUST be done today`,
            `For other tasks, reach out to instructors about extensions`,
            `Take a 5-minute breathing break before starting`,
            `Consider asking a friend or tutor for help`
        ];
        analysis.encouragement = `You're in a tough spot, but you can get through this. Focus on what's truly essential.`;
    } else if (totalEstimatedTime > availableTime * 2) {
        analysis.priority = 'high';
        analysis.situation = `You have ${totalEstimatedTime.toFixed(1)}h of work but only ${availableTime}h available.`;
        analysis.reality = `Mathematically, you can't complete everything. That's okay - let's prioritize.`;
        analysis.suggestions = [
            `Focus on high-weightage tasks first (${highPriorityTasks.length} tasks)`,
            `Identify tasks where you can request extensions`,
            `Break down large tasks into smaller chunks`,
            `Consider which tasks you can do "good enough" vs perfect`
        ];
        analysis.encouragement = `Quality over quantity. Do your best work on what matters most.`;
    } else if (stressLevel >= 7 && pendingTasks.length <= 3) {
        analysis.priority = 'medium';
        analysis.situation = `You're stressed (${stressLevel}/10) but only have ${pendingTasks.length} tasks.`;
        analysis.reality = `Your workload is manageable. The stress might be coming from perfectionism or other factors.`;
        analysis.suggestions = [
            `Remember: done is better than perfect`,
            `Break tasks into 25-minute focused sessions`,
            `Take breaks between tasks`,
            `Consider if non-academic factors are adding to stress`
        ];
        analysis.encouragement = `You've got this. The workload is reasonable - trust yourself.`;
    } else if (totalEstimatedTime <= availableTime && stressLevel <= 5) {
        analysis.priority = 'low';
        analysis.situation = `You have ${pendingTasks.length} tasks and ${availableTime}h available.`;
        analysis.reality = `Your schedule is realistic and manageable.`;
        analysis.suggestions = [
            `Create a simple schedule for when you'll tackle each task`,
            `Start with the hardest task while you're fresh`,
            `Build in buffer time for unexpected issues`,
            `Remember to take breaks`
        ];
        analysis.encouragement = `You're in a good position. Stay organized and you'll do great!`;
    } else {
        analysis.priority = 'normal';
        analysis.situation = `You have ${pendingTasks.length} pending tasks with stress at ${stressLevel}/10.`;
        analysis.reality = `This is a normal academic workload. You can handle this.`;
        analysis.suggestions = [
            `Prioritize tasks by due date and importance`,
            `Use the Pomodoro technique (25 min work, 5 min break)`,
            `Start with one task and build momentum`,
            `Celebrate small wins along the way`
        ];
        analysis.encouragement = `You're doing fine. One task at a time, and you'll get through it.`;
    }

    return analysis;
};

module.exports = { analyzePerspective };
