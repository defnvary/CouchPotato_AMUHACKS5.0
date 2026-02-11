import { useState, useEffect } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TaskBreakdown from './TaskBreakdown';

const TaskInput = ({ subjects, task, onTaskSaved, onSubjectAdded, onClose }) => {
    const { error: showError, success } = useToast();
    const isEditMode = !!task;
    const [isNewSubject, setIsNewSubject] = useState(false);
    const [subjectId, setSubjectId] = useState(task?.subject?._id || task?.subject || '');
    const [newSubjectName, setNewSubjectName] = useState('');

    const [title, setTitle] = useState(task?.title || '');
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    );
    const [type, setType] = useState(task?.type || 'Assignment');
    const [weightage, setWeightage] = useState(task?.weightage || 10);
    const [subtasks, setSubtasks] = useState(task?.subtasks || []);
    const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || 60);
    const [loading, setLoading] = useState(false);

    // Set default subject if available
    useEffect(() => {
        if (subjects.length > 0 && !subjectId && !isEditMode) {
            setSubjectId(subjects[0]._id);
        }
    }, [subjects, subjectId, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalSubjectId = subjectId;

            // 1. Create Subject if new
            if (isNewSubject) {
                const res = await api.post('/student/subject', { name: newSubjectName });
                finalSubjectId = res.data._id;
                onSubjectAdded(res.data);
            }

            // 2. Create or Update Task
            if (isEditMode) {
                await api.put(`/student/task/${task._id}`, {
                    subjectId: finalSubjectId,
                    title,
                    dueDate,
                    type,
                    weightage: Number(weightage),
                    subtasks,
                    estimatedTime
                });
            } else {
                await api.post('/student/task', {
                    subjectId: finalSubjectId,
                    title,
                    dueDate,
                    type,
                    weightage: Number(weightage),
                    subtasks,
                    estimatedTime
                });
            }

            onTaskSaved();
            onClose();
        } catch (error) {
            console.error("Failed to save task", error);
            showError("Failed to save task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-academic-400 hover:text-academic-600">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-serif text-academic-900 mb-6">
                    {isEditMode ? 'Edit Assignment' : 'Add New Assignment'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-1">Subject</label>
                        {!isNewSubject ? (
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    required={!isNewSubject}
                                >
                                    <option value="" disabled>Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsNewSubject(true)}
                                    className="p-2 bg-academic-100 text-academic-600 rounded hover:bg-academic-200"
                                    title="Add New Subject"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Subject Name (e.g. Biology)"
                                    className="flex-1 p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    required={isNewSubject}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsNewSubject(false)}
                                    className="px-3 py-2 text-xs text-academic-500 hover:text-academic-700 underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Task Details */}
                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Lab Report 4"
                            className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Type</label>
                            <select
                                className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="Assignment">Assignment</option>
                                <option value="Exam">Exam</option>
                                <option value="Project">Project</option>
                                <option value="Study">Study</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex justify-between text-sm font-medium text-academic-700 mb-1">
                            <span>Weightage (Impact on Grade)</span>
                            <span className="font-bold text-sage-600">{weightage}%</span>
                        </label>
                        <input
                            type="range" min="1" max="100"
                            value={weightage} onChange={(e) => setWeightage(e.target.value)}
                            className="w-full h-2 bg-academic-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
                        />
                        <div className="flex justify-between text-xs text-academic-400 mt-1">
                            <span>Minor HW</span>
                            <span>Final Exam</span>
                        </div>
                    </div>

                    {/* Task Breakdown */}
                    {!isEditMode && (
                        <TaskBreakdown
                            taskTitle={title}
                            onSubtasksGenerated={(generatedSubtasks, totalTime) => {
                                setSubtasks(generatedSubtasks);
                                setEstimatedTime(totalTime);
                            }}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-sage-700 text-white rounded hover:bg-sage-800 flex justify-center items-center mt-6 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isEditMode ? 'Save Changes' : 'Add Assignment')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskInput;
