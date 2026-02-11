import { useState, useEffect } from 'react';
import { Flame, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

const SmartPrioritizer = ({ tasks, onTaskComplete, onTaskEdit }) => {
    const [prioritizedTasks, setPrioritizedTasks] = useState({
        critical: [],
        important: [],
        canWait: [],
        optional: []
    });

    useEffect(() => {
        if (tasks) {
            categorizeTasks(tasks);
        }
    }, [tasks]);

    const categorizeTasks = (allTasks) => {
        const now = new Date();
        const pendingTasks = allTasks.filter(t => t.status === 'Pending');

        const categorized = {
            critical: [],
            important: [],
            canWait: [],
            optional: []
        };

        pendingTasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
            const weightage = task.weightage || 0;

            // Critical: Due within 24 hours OR high weightage (>30%)
            if (hoursUntilDue <= 24 || weightage >= 30) {
                categorized.critical.push(task);
            }
            // Important: Due within 3 days OR medium weightage (15-30%)
            else if (hoursUntilDue <= 72 || weightage >= 15) {
                categorized.important.push(task);
            }
            // Can Wait: Due within 7 days
            else if (hoursUntilDue <= 168) {
                categorized.canWait.push(task);
            }
            // Optional: Everything else
            else {
                categorized.optional.push(task);
            }
        });

        // Sort each category by urgency
        Object.keys(categorized).forEach(key => {
            categorized[key].sort((a, b) => {
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                return dateA - dateB;
            });
        });

        setPrioritizedTasks(categorized);
    };

    const getTimeUntilDue = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const hours = Math.floor((due - now) / (1000 * 60 * 60));

        if (hours < 0) return 'Overdue!';
        if (hours < 24) return `${hours}h left`;
        const days = Math.floor(hours / 24);
        return `${days}d left`;
    };

    const TaskCard = ({ task, priority }) => {
        const timeLeft = getTimeUntilDue(task.dueDate);
        const isOverdue = timeLeft === 'Overdue!';

        return (
            <div className={`p-3 rounded-lg border transition-all hover:shadow-md ${priority === 'critical' ? 'bg-red-50 border-red-200' :
                priority === 'important' ? 'bg-orange-50 border-orange-200' :
                    priority === 'canWait' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-academic-50 border-academic-200'
                }`}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-academic-900">{task.title}</h4>
                        <p className="text-xs text-academic-600 mt-1">
                            {task.subject?.name || 'No subject'} • {task.type}
                        </p>
                    </div>
                    <button
                        onClick={() => onTaskComplete(task._id)}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Mark complete"
                    >
                        <CheckCircle2 size={18} className="text-academic-400 hover:text-green-600" />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-academic-600'}`}>
                            <Clock size={12} />
                            {timeLeft}
                        </span>
                        <span className="text-academic-500">
                            {task.weightage}% of grade
                        </span>
                    </div>
                    {task.estimatedTime && (
                        <span className="text-academic-500">
                            ~{Math.round(task.estimatedTime / 60)}h
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const PriorityColumn = ({ title, tasks, icon: Icon, color, priority }) => (
        <div className="flex-1 min-w-[250px]">
            <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${color}`}>
                <Icon size={18} />
                <h3 className="font-medium text-sm">{title}</h3>
                <span className="ml-auto text-xs font-bold">{tasks.length}</span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task._id} task={task} priority={priority} />
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-academic-400 bg-academic-50 rounded-lg border border-dashed border-academic-200">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-academic-200 p-6">
            <div className="mb-6">
                <h2 className="text-lg font-serif font-bold text-academic-900 mb-1">Smart Task Prioritizer</h2>
                <p className="text-sm text-academic-600">AI-sorted by urgency, deadline, and grade impact</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
                <PriorityColumn
                    title="Critical"
                    tasks={prioritizedTasks.critical}
                    icon={Flame}
                    color="bg-red-100 text-red-800"
                    priority="critical"
                />
                <PriorityColumn
                    title="Important"
                    tasks={prioritizedTasks.important}
                    icon={AlertTriangle}
                    color="bg-orange-100 text-orange-800"
                    priority="important"
                />
                <PriorityColumn
                    title="Can Wait"
                    tasks={prioritizedTasks.canWait}
                    icon={Clock}
                    color="bg-yellow-100 text-yellow-800"
                    priority="canWait"
                />
                <PriorityColumn
                    title="Optional"
                    tasks={prioritizedTasks.optional}
                    icon={CheckCircle2}
                    color="bg-academic-100 text-academic-800"
                    priority="optional"
                />
            </div>

            <div className="mt-4 p-3 bg-sage-50 rounded-lg border border-sage-200">
                <p className="text-xs text-sage-800">
                    <strong>Tip: Focus on Critical tasks first!</strong> These have the biggest impact on your grades or are due very soon.
                </p>
            </div>
        </div>
    );
};

export default SmartPrioritizer;
