import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Award, Calendar } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

const ProgressStats = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await api.get('/student/progress');
            setProgress(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-academic-400">Loading progress...</div>;
    if (!progress) return null;

    const stressData = progress.stressTrend.map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        stress: item.stressLevel,
        hours: item.availableTime
    })).reverse().slice(0, 14); // Last 14 days

    return (
        <div className="bg-white border border-academic-200 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-serif font-bold text-academic-800">Your Progress</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-sage-50 rounded-lg">
                    <Award className="mx-auto text-sage-600 mb-1" size={20} />
                    <p className="text-2xl font-bold text-sage-800">{progress.totalCompleted}</p>
                    <p className="text-xs text-sage-600">Total Completed</p>
                </div>
                <div className="text-center p-3 bg-academic-50 rounded-lg">
                    <Calendar className="mx-auto text-academic-600 mb-1" size={20} />
                    <p className="text-2xl font-bold text-academic-800">{progress.last7Days}</p>
                    <p className="text-xs text-academic-600">This Week</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <TrendingDown className="mx-auto text-amber-600 mb-1" size={20} />
                    <p className="text-2xl font-bold text-amber-800">{progress.last30Days}</p>
                    <p className="text-xs text-amber-600">This Month</p>
                </div>
            </div>

            {/* Stress Trend Chart */}
            {stressData.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-academic-700 mb-3">Stress Level Trend (Last 14 Days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={stressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                domain={[0, 10]}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="stress"
                                stroke="#7c9885"
                                strokeWidth={2}
                                dot={{ fill: '#7c9885', r: 3 }}
                                name="Stress Level"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Completions */}
            {progress.completedTasks.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-academic-700 mb-3">Recent Completions</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {progress.completedTasks.slice(0, 5).map((ct, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-academic-50 rounded">
                                <div>
                                    <p className="font-medium text-academic-800">{ct.taskSnapshot.title}</p>
                                    <p className="text-academic-500">{ct.taskSnapshot.subject}</p>
                                </div>
                                <p className="text-academic-400">{format(new Date(ct.completedAt), 'MMM d')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressStats;
