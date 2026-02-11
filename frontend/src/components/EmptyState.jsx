import { FileQuestion, Plus, Inbox, Users, AlertCircle } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Inbox,
    title,
    message,
    actionText,
    onAction,
    variant = 'default'
}) => {
    const variants = {
        default: 'bg-academic-50 border-academic-200',
        primary: 'bg-sage-50 border-sage-200',
        warning: 'bg-orange-50 border-orange-200',
    };

    const iconColors = {
        default: 'text-academic-400',
        primary: 'text-sage-500',
        warning: 'text-orange-500',
    };

    return (
        <div className={`flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed ${variants[variant]}`}>
            <div className={`mb-4 ${iconColors[variant]}`}>
                <Icon size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-serif font-bold text-academic-900 mb-2">
                {title}
            </h3>
            <p className="text-sm text-academic-600 text-center max-w-md mb-6">
                {message}
            </p>
            {onAction && actionText && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 px-4 py-2 bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-all hover:scale-105 shadow-sm"
                >
                    <Plus size={18} />
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
