import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarHeatmap from '../components/CalendarHeatmap';
import GradeSimulator from '../components/GradeSimulator';
import StressTimeline from '../components/StressTimeline';
import SmartPrioritizer from '../components/SmartPrioritizer';
import AchievementShowcase from '../components/AchievementShowcase';
import api from '../utils/api';

const AnalyticsDashboard = () => {
    const { user, logout } = useAuth();
    const { error: showError, success } = useToast();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/student/dashboard');
            setTasks(res.data.tasks || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskComplete = async (taskId) => {
        try {
            await api.put(`/student/task/${taskId}/complete`);
            fetchData();
        } catch (error) {
            showError('Failed to complete task');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-academic-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-academic-50">
            {/* Header */}
            <header className="bg-white border-b border-academic-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="p-2 hover:bg-academic-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-sage-600" size={24} />
                                <div>
                                    <h1 className="text-xl font-serif font-bold text-academic-900">Analytics Hub</h1>
                                    <p className="text-xs text-academic-500">Insights & Performance</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-academic-600 hidden sm:inline">
                                {user?.name}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm text-academic-500 hover:text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Achievement Showcase */}
                <AchievementShowcase />

                {/* Smart Prioritizer - Full Width */}
                <SmartPrioritizer
                    tasks={tasks}
                    onTaskComplete={handleTaskComplete}
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calendar Heatmap */}
                    <CalendarHeatmap />

                    {/* Grade Simulator */}
                    <GradeSimulator />
                </div>

                {/* Stress Timeline - Full Width */}
                <StressTimeline />

                {/* Info Card */}
                <div className="bg-gradient-to-r from-sage-50 to-purple-50 rounded-lg border border-sage-200 p-6">
                    <h3 className="font-serif font-bold text-academic-900 mb-2">
                        Your Complete Analytics Suite
                    </h3>
                    <p className="text-sm text-academic-700">
                        Track your progress, visualize your workload, simulate grade impacts, and earn achievements.
                        All designed to help you bounce back from academic stress and stay on track.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
