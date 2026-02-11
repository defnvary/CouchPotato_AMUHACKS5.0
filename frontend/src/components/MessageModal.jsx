import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { X, Send, Loader2 } from 'lucide-react';
import api from '../utils/api';

const MessageModal = ({ student, onClose, onSent }) => {
    const { error: showError } = useToast();
    const [subject, setSubject] = useState('Check-in');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('message');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                showError('You are not logged in. Please login again.');
                setLoading(false);
                return;
            }

            // Try to send via API
            const response = await api.post('/teacher/message', {
                studentId: student._id,
                subject,
                message,
                type
            });

            console.log('✅ Message sent successfully:', response.data);
            onSent?.();
            onClose();
        } catch (error) {
            console.error('❌ Error sending message:', error);
            console.error('Status:', error.response?.status);
            console.error('Error data:', error.response?.data);

            if (error.response?.status === 401) {
                showError('Authentication failed. Please logout and login again as a teacher.');
            } else {
                showError('Failed to send message: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-academic-400 hover:text-academic-600">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-serif text-academic-900 mb-4">
                    Send Message to {student.name}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-1">Type</label>
                        <select
                            className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="message">General Message</option>
                            <option value="check-in">Check-in Request</option>
                            <option value="intervention">Intervention</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-1">Subject</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-academic-700 mb-1">Message</label>
                        <textarea
                            className="w-full p-2 border border-academic-300 rounded focus:ring-1 focus:ring-sage-500 h-32"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-sage-700 text-white rounded hover:bg-sage-800 flex justify-center items-center gap-2 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                <Send size={16} />
                                Send Message
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessageModal;
