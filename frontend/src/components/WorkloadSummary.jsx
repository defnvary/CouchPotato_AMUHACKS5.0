import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const WorkloadSummary = () => {
    const [workload, setWorkload] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkload();
    }, []);

    const fetchWorkload = async () => {
        try {
            const res = await api.get('/student/workload');
            setWorkload(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !workload) return null;

    const getStatusIcon = () => {
        if (workload.isRealistic) {
            return <CheckCircle className="text-green-600" size={20} />;
        }
        return <AlertTriangle className="text-amber-600" size={20} />;
    };

    const getStatusColor = () => {
        if (workload.isRealistic) {
            return 'bg-green-50 border-green-200 text-green-800';
        }
        return 'bg-amber-50 border-amber-200 text-amber-800';
    };

    return (
        <div className={`p-4 rounded-lg border ${getStatusColor()} flex items-center gap-3`}>
            {getStatusIcon()}
            <div className="flex-1">
                <p className="text-sm font-medium">
                    Today's Workload: {workload.taskCount} tasks, ~{workload.totalHours}h
                </p>
                {!workload.isRealistic && (
                    <p className="text-xs mt-1">
                        Warning: This might be too much for one day. Consider prioritizing.
                    </p>
                )}
            </div>
            <Clock size={16} />
        </div>
    );
};

export default WorkloadSummary;
