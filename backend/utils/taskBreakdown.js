// Task Breakdown Utility - Rule-based templates for common academic tasks

const taskBreakdownTemplates = {
    'research paper': [
        { step: 'Choose and narrow down topic', time: 30 },
        { step: 'Research and gather sources', time: 90 },
        { step: 'Create detailed outline', time: 45 },
        { step: 'Write introduction', time: 30 },
        { step: 'Write body paragraphs', time: 120 },
        { step: 'Write conclusion', time: 30 },
        { step: 'Edit and proofread', time: 60 },
        { step: 'Format citations and bibliography', time: 30 }
    ],
    'exam prep': [
        { step: 'Review lecture notes and materials', time: 60 },
        { step: 'Create summary notes or flashcards', time: 45 },
        { step: 'Practice problems or past papers', time: 90 },
        { step: 'Review difficult concepts', time: 45 },
        { step: 'Take practice test', time: 60 },
        { step: 'Review mistakes and gaps', time: 30 }
    ],
    'study': [
        { step: 'Review class notes', time: 30 },
        { step: 'Read assigned chapters', time: 60 },
        { step: 'Create summary notes', time: 30 },
        { step: 'Practice exercises', time: 45 }
    ],
    'project': [
        { step: 'Understand requirements', time: 20 },
        { step: 'Plan and outline approach', time: 30 },
        { step: 'Research and gather materials', time: 60 },
        { step: 'Create first draft/prototype', time: 120 },
        { step: 'Review and refine', time: 60 },
        { step: 'Final polish and testing', time: 45 }
    ],
    'assignment': [
        { step: 'Read and understand instructions', time: 15 },
        { step: 'Gather necessary materials', time: 20 },
        { step: 'Complete main work', time: 90 },
        { step: 'Review and check answers', time: 30 }
    ],
    'presentation': [
        { step: 'Research topic thoroughly', time: 60 },
        { step: 'Create outline and structure', time: 30 },
        { step: 'Design slides', time: 60 },
        { step: 'Write speaker notes', time: 30 },
        { step: 'Practice delivery', time: 45 },
        { step: 'Final review and adjustments', time: 20 }
    ],
    'lab report': [
        { step: 'Review experiment data', time: 20 },
        { step: 'Write introduction and hypothesis', time: 30 },
        { step: 'Document methods and procedures', time: 30 },
        { step: 'Analyze results and create graphs', time: 60 },
        { step: 'Write discussion and conclusion', time: 45 },
        { step: 'Proofread and format', time: 30 }
    ]
};

const detectTaskType = (title) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('paper') || lowerTitle.includes('essay')) return 'research paper';
    if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('quiz')) return 'exam prep';
    if (lowerTitle.includes('study') || lowerTitle.includes('review')) return 'study';
    if (lowerTitle.includes('project')) return 'project';
    if (lowerTitle.includes('presentation') || lowerTitle.includes('present')) return 'presentation';
    if (lowerTitle.includes('lab') || lowerTitle.includes('experiment')) return 'lab report';
    if (lowerTitle.includes('assignment') || lowerTitle.includes('homework')) return 'assignment';

    return 'assignment'; // default
};

const adjustForSpiciness = (subtasks, spiciness) => {
    // Spiciness: 1 = less detail, 2 = normal, 3 = very detailed
    if (spiciness === 1) {
        // Combine some steps, reduce detail
        return subtasks.filter((_, idx) => idx % 2 === 0).map(task => ({
            ...task,
            time: task.time * 1.5
        }));
    } else if (spiciness === 3) {
        // Add more granular steps
        const detailed = [];
        subtasks.forEach(task => {
            if (task.time > 60) {
                // Split long tasks
                const parts = Math.ceil(task.time / 45);
                for (let i = 0; i < parts; i++) {
                    detailed.push({
                        step: `${task.step} - Part ${i + 1}`,
                        time: Math.ceil(task.time / parts)
                    });
                }
            } else {
                detailed.push(task);
            }
        });
        return detailed;
    }

    return subtasks; // Normal detail
};

const breakdownTask = (title, spiciness = 2) => {
    const taskType = detectTaskType(title);
    const template = taskBreakdownTemplates[taskType] || taskBreakdownTemplates['assignment'];

    const subtasks = adjustForSpiciness([...template], spiciness);

    return {
        taskType,
        subtasks: subtasks.map((task, idx) => ({
            id: `subtask-${idx}`,
            title: task.step,
            estimatedTime: task.time,
            completed: false
        })),
        totalEstimatedTime: subtasks.reduce((sum, task) => sum + task.time, 0)
    };
};

module.exports = { breakdownTask, detectTaskType };
