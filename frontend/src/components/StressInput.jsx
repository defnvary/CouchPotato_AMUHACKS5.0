import { useState } from 'react';
import { Loader2, Brain } from 'lucide-react';
import PerspectiveCheck from './PerspectiveCheck';

const StressInput = ({ onSubmit, onClose }) => {
    const [stress, setStress] = useState(5);
    const [hours, setHours] = useState(2);
    const [loading, setLoading] = useState(false);
    const [showPerspective, setShowPerspective] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ stressLevel: stress, availableTime: hours, notes: '' });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-serif text-academic-900 mb-4">Daily Check-in</h2>
                <p className="text-academic-500 text-sm mb-6">
                    Help us adjust your plan. Be honest—your data is private.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-academic-700 mb-2">
                            <span>Stress Level</span>
                            <span className="font-bold text-sage-600">{stress}/10</span>
                        </label>
                        <input
                            type="range" min="1" max="10"
                            value={stress} onChange={(e) => setStress(Number(e.target.value))}
                            className="w-full h-2 bg-academic-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
                        />
                        <div className="flex justify-between text-xs text-academic-400 mt-1">
                            <span>Calm</span>
                            <span>Overwhelmed</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-2">
                            Available Study Hours
                        </label>
                        <input
                            type="number" min="0" max="24" step="0.5"
                            value={hours} onChange={(e) => setHours(e.target.value)}
                            className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                        />
                    </div>

                    {/* Get Perspective Button */}
                    {stress >= 6 && (
                        <button
                            type="button"
                            onClick={() => setShowPerspective(true)}
                            className="w-full py-2 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Brain size={16} />
                            Get Perspective on My Workload
                        </button>
                    )}

                    <div className="flex gap-3 justify-end">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-academic-600 hover:bg-academic-50 rounded"
                            >
                                Skip
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-sage-600 text-white rounded hover:bg-sage-700 flex items-center"
                        >
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Generate Plan
                        </button>
                    </div>
                </form>
            </div>

            {showPerspective && (
                <PerspectiveCheck
                    stressLevel={stress}
                    availableTime={hours}
                    onClose={() => setShowPerspective(false)}
                />
            )}
        </div>
    );
};

export default StressInput;
