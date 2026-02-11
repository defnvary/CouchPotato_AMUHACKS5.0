import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Brain, Loader2, X } from 'lucide-react';
import api from '../utils/api';

const PerspectiveCheck = ({ stressLevel, availableTime, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [perspective, setPerspective] = useState(null);
    const { error: showError } = useToast();

    const handleGetPerspective = async () => {
        setLoading(true);
        try {
            const res = await api.post('/student/perspective', {
                stressLevel,
                availableTime
            });
            setPerspective(res.data);
        } catch (error) {
            console.error(error);
            showError('Failed to get perspective');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-50 border-red-200 text-red-900';
            case 'high': return 'bg-orange-50 border-orange-200 text-orange-900';
            case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
            default: return 'bg-green-50 border-green-200 text-green-900';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-academic-400 hover:text-academic-600"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <Brain className="text-purple-600" size={24} />
                    <h2 className="text-xl font-serif text-academic-900">Get Perspective</h2>
                </div>

                {!perspective ? (
                    <div className="space-y-4">
                        <p className="text-sm text-academic-600">
                            Feeling overwhelmed? Let's analyze your current situation and get some perspective.
                        </p>
                        <button
                            onClick={handleGetPerspective}
                            disabled={loading}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain size={18} />
                                    Analyze My Situation
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Priority Badge */}
                        <div className={`p-3 rounded-lg border ${getPriorityColor(perspective.priority)}`}>
                            <p className="font-medium text-sm">{perspective.situation}</p>
                        </div>

                        {/* Reality Check */}
                        <div className="bg-academic-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-academic-700 mb-1">Reality Check:</p>
                            <p className="text-sm text-academic-600">{perspective.reality}</p>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <p className="text-sm font-medium text-academic-700 mb-2">What You Can Do:</p>
                            <ul className="space-y-2">
                                {perspective.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-academic-600">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Encouragement */}
                        <div className="bg-sage-50 p-3 rounded-lg border border-sage-200">
                            <p className="text-sm text-sage-800 italic">{perspective.encouragement}</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-academic-100 text-academic-700 rounded-lg hover:bg-academic-200 transition-colors"
                        >
                            Got It
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerspectiveCheck;
