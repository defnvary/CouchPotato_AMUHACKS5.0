import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-academic-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-sage-600 mb-4">404</h1>
                <h2 className="text-2xl font-serif font-bold text-academic-900 mb-2">Page Not Found</h2>
                <p className="text-academic-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-academic-100 text-academic-700 rounded-lg hover:bg-academic-200 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                    >
                        <Home size={18} />
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
