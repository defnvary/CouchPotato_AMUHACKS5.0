import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.put('/auth/profile', formData);
            success('Profile updated successfully');

            // Update local storage
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (user?.role === 'student') navigate('/student/dashboard');
        else if (user?.role === 'teacher') navigate('/teacher/dashboard');
        else if (user?.role === 'admin') navigate('/admin/dashboard');
        else navigate('/login');
    };

    return (
        <div className="min-h-screen bg-academic-50">
            {/* Header */}
            <header className="bg-white border-b border-academic-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={goBack} className="p-2 hover:bg-academic-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-serif font-bold text-academic-900">Profile Settings</h1>
                            <p className="text-xs text-academic-500">Manage your account</p>
                        </div>
                    </div>
                    <button onClick={logout} className="text-sm text-academic-500 hover:text-red-600">
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Profile Information */}
                <div className="bg-white rounded-lg border border-academic-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-sage-600" size={20} />
                        <h2 className="text-lg font-serif font-bold text-academic-900">Profile Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-academic-300 rounded focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border border-academic-300 rounded focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={user?.role || ''}
                                disabled
                                className="w-full p-2 border border-academic-200 rounded bg-academic-50 text-academic-500 cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded hover:bg-sage-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg border border-academic-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="text-sage-600" size={20} />
                        <h2 className="text-lg font-serif font-bold text-academic-900">Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full p-2 border border-academic-300 rounded focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full p-2 border border-academic-300 rounded focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-academic-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full p-2 border border-academic-300 rounded focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded hover:bg-sage-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Lock size={18} />}
                            Change Password
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
