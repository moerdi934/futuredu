import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Container, Row, Col, Card, Form } from 'react-bootstrap';
import { 
  Heart, 
  Star, 
  Play, 
  Save, 
  Trash2, 
  Check, 
  X, 
  Plus,
  Download,
  Upload,
  Settings,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Edit,
  Eye,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ButtonProps {
  action: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Color schemes for different actions
const getActionColors = (action: string) => {
  const colorSchemes = {
    'Save': {
      primary: '#10B981', secondary: '#059669', light: '#D1FAE5', dark: '#047857',
      gradient1: '#10B981', gradient2: '#059669', border: '#047857', text: '#FFFFFF'
    },
    'Cancel': {
      primary: '#6B7280', secondary: '#4B5563', light: '#F3F4F6', dark: '#374151',
      gradient1: '#6B7280', gradient2: '#4B5563', border: '#374151', text: '#FFFFFF'
    },
    'Apply': {
      primary: '#8B5CF6', secondary: '#7C3AED', light: '#EDE9FE', dark: '#6D28D9',
      gradient1: '#8B5CF6', gradient2: '#7C3AED', border: '#6D28D9', text: '#FFFFFF'
    },
    'Finish': {
      primary: '#059669', secondary: '#047857', light: '#D1FAE5', dark: '#065F46',
      gradient1: '#059669', gradient2: '#10B981', border: '#047857', text: '#FFFFFF'
    },
    'Clear': {
      primary: '#F59E0B', secondary: '#D97706', light: '#FEF3C7', dark: '#B45309',
      gradient1: '#F59E0B', gradient2: '#D97706', border: '#B45309', text: '#FFFFFF'
    },
    'Done': {
      primary: '#10B981', secondary: '#059669', light: '#ECFDF5', dark: '#047857',
      gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF'
    },
    'Start': {
      primary: '#3B82F6', secondary: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8',
      gradient1: '#3B82F6', gradient2: '#2563EB', border: '#1D4ED8', text: '#FFFFFF'
    },
    'Continue': {
      primary: '#06B6D4', secondary: '#0891B2', light: '#CFFAFE', dark: '#0E7490',
      gradient1: '#06B6D4', gradient2: '#0891B2', border: '#0E7490', text: '#FFFFFF'
    },
    'Submit': {
      primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9',
      gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF'
    },
    'Delete': {
      primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C',
      gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF'
    },
    'Edit': {
      primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309',
      gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF'
    },
    'View': {
      primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF',
      gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF'
    },
    'Download': {
      primary: '#06B6D4', secondary: '#0891B2', light: '#F0F9FF', dark: '#0E7490',
      gradient1: '#06B6D4', gradient2: '#22D3EE', border: '#0891B2', text: '#FFFFFF'
    },
    'Upload': {
      primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857',
      gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF'
    },
    'Search': {
      primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151',
      gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF'
    },
  };
  return colorSchemes[action as keyof typeof colorSchemes] || colorSchemes.Apply;
};

// Get appropriate icon for action
const getActionIcon = (action: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Save': <Save className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Cancel': <X className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Apply': <Check className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Finish': <CheckCircle className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Clear': <XCircle className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Done': <CheckCircle className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Start': <Play className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Continue': <Play className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Submit': <Upload className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Delete': <Trash2 className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Edit': <Edit className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'View': <Eye className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Download': <Download className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Upload': <Upload className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
    'Search': <Search className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />,
  };
  return iconMap[action] || <AlertCircle className="tw-inline tw-mr-2 tw-w-5 tw-h-5" />;
};

// Button Components for Kids (Colorful & Playful)
const Button1: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-relative tw-px-8 tw-py-4 tw-font-bold tw-rounded-full tw-shadow-lg tw-transform tw-transition tw-duration-300 hover:tw-scale-105 hover:tw-shadow-xl disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-animate-pulse"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
      <div className="tw-absolute tw-inset-0 tw-bg-white tw-opacity-0 hover:tw-opacity-20 tw-rounded-full tw-transition tw-duration-300"></div>
    </button>
  );
};

const Button2: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-extrabold tw-rounded-lg tw-border-4 tw-shadow-lg tw-transform tw-transition hover:tw-rotate-1 hover:tw-scale-110 disabled:tw-opacity-50 tw-relative tw-overflow-hidden"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      <div style={{ display: 'inline-block', animation: 'spin 2s linear infinite' }}>
        {icon}
      </div>
      {loading ? 'Loading...' : action}
      <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-bg-gradient-to-r tw-from-transparent tw-via-white tw-to-transparent tw-opacity-30 tw-transform tw--skew-x-12"></div>
    </button>
  );
};

const Button3: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-8 tw-py-4 tw-font-bold tw-rounded-2xl tw-shadow-2xl tw-transform tw-transition tw-duration-500 disabled:tw-opacity-50 tw-border-b-4 hover:tw-border-b-2 hover:tw-translate-y-1"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        borderBottomColor: colors.border,
        boxShadow: `0 25px 50px -12px ${colors.primary}50`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.secondary}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.primary}50`;
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

const Button4: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-group tw-px-6 tw-py-3 tw-font-bold tw-rounded-xl tw-shadow-lg tw-transform tw-transition tw-duration-300 hover:tw-scale-105 disabled:tw-opacity-50 tw-relative tw-overflow-hidden"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to bottom right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
      }}
    >
      <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-white tw-to-transparent tw-opacity-0 group-hover:tw-opacity-20 tw-transition tw-duration-300"></div>
      <div style={{ display: 'inline-block', animation: 'bounce 2s infinite' }}>
        {icon}
      </div>
      <span className="tw-relative tw-z-10">{loading ? 'Loading...' : action}</span>
    </button>
  );
};

const Button5: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-8 tw-py-4 tw-font-bold tw-rounded-full tw-shadow-lg tw-transform tw-transition tw-duration-300 tw-border-4 disabled:tw-opacity-50"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        borderColor: colors.light,
        boxShadow: `0 10px 25px ${colors.primary}50`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
        e.currentTarget.style.borderColor = colors.primary;
        e.currentTarget.style.boxShadow = `0 10px 25px ${colors.secondary}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
        e.currentTarget.style.borderColor = colors.light;
        e.currentTarget.style.boxShadow = `0 10px 25px ${colors.primary}50`;
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

const Button6: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-bold tw-rounded-lg tw-shadow-xl tw-transform tw-transition tw-duration-300 hover:tw-scale-110 hover:tw-rotate-2 disabled:tw-opacity-50 tw-border-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        borderColor: colors.light,
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

const Button7: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-8 tw-py-4 tw-font-bold tw-rounded-2xl tw-shadow-2xl tw-transform tw-transition tw-duration-500 hover:tw-scale-105 disabled:tw-opacity-50 tw-relative tw-overflow-hidden"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        boxShadow: `0 25px 50px -12px ${colors.primary}50`,
      }}
    >
      <div 
        className="tw-absolute tw-inset-0 tw-opacity-0 hover:tw-opacity-100 tw-transition tw-duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.secondary}, ${colors.dark})`,
        }}
      ></div>
      <span className="tw-relative tw-z-10">{icon}</span>
      <span className="tw-relative tw-z-10">{loading ? 'Loading...' : action}</span>
    </button>
  );
};

const Button8: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-bold tw-rounded-full tw-shadow-lg tw-transform tw-transition tw-duration-300 tw-border-4 hover:tw-scale-110 disabled:tw-opacity-50"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        borderColor: colors.light,
        boxShadow: `0 10px 25px ${colors.primary}50`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
        e.currentTarget.style.boxShadow = `0 10px 25px ${colors.secondary}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
        e.currentTarget.style.boxShadow = `0 10px 25px ${colors.primary}50`;
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

const Button9: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-8 tw-py-4 tw-font-bold tw-rounded-xl tw-shadow-2xl tw-transform tw-transition tw-duration-300 hover:tw-scale-105 disabled:tw-opacity-50 tw-animate-bounce"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to bottom right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        boxShadow: `0 25px 50px -12px ${colors.primary}50`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.secondary}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.primary}50`;
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

const Button10: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-bold tw-rounded-2xl tw-shadow-xl tw-transform tw-transition tw-duration-500 hover:tw-scale-110 hover:tw-rotate-3 disabled:tw-opacity-50 tw-border-b-4"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        borderBottomColor: colors.border,
      }}
    >
      {icon}
      {loading ? 'Loading...' : action}
    </button>
  );
};

// Professional Buttons for CRM
const Button11: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-md tw-shadow-sm tw-transform tw-transition tw-duration-200 hover:tw-shadow-lg disabled:tw-opacity-50 disabled:tw-cursor-not-allowed focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button12: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-2.5 tw-bg-white tw-font-medium tw-rounded-md tw-border tw-shadow-sm tw-transition tw-duration-200 disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        color: colors.primary,
        borderColor: colors.primary,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.light;
        e.currentTarget.style.borderColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button13: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-lg tw-shadow-md tw-transform tw-transition tw-duration-200 hover:tw-scale-105 hover:tw-shadow-lg disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button14: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-md tw-shadow-sm tw-transition tw-duration-200 hover:tw-shadow-md disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.secondary,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.dark;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button15: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-2.5 tw-font-medium tw-rounded-md tw-border tw-transition tw-duration-200 disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.light,
        color: colors.dark,
        borderColor: colors.primary,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary + '20';
        e.currentTarget.style.borderColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.light;
        e.currentTarget.style.borderColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button16: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-lg tw-shadow-sm tw-transition tw-duration-200 hover:tw-shadow-md disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button17: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-2.5 tw-bg-white tw-font-medium tw-rounded-md tw-border tw-shadow-sm tw-transition tw-duration-200 disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        color: colors.secondary,
        borderColor: colors.secondary,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.light;
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = colors.secondary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button18: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-md tw-shadow-sm tw-transition tw-duration-200 hover:tw-shadow-md disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button19: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-3 tw-font-medium tw-rounded-lg tw-shadow-sm tw-transition tw-duration-200 hover:tw-shadow-md disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.dark,
        color: colors.text,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.dark;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const Button20: React.FC<ButtonProps> = ({ action, onClick, disabled, loading }) => {
  const colors = getActionColors(action);
  const icon = getActionIcon(action);
  
  return (
    <button
      className="tw-px-6 tw-py-2.5 tw-font-medium tw-rounded-md tw-border tw-transition tw-duration-200 disabled:tw-opacity-50 focus:tw-outline-none focus:tw-ring-2"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: colors.light,
        color: colors.primary,
        borderColor: colors.primary,
        focusRingColor: colors.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary + '30';
        e.currentTarget.style.borderColor = colors.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.light;
        e.currentTarget.style.borderColor = colors.primary;
      }}
    >
      {icon}
      {loading ? 'Processing...' : action}
    </button>
  );
};

const ButtonDemo: React.FC = () => {
  const router = useRouter();
  const { button } = router.query;
  const [selectedAction, setSelectedAction] = useState<string>('Save');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const actions = ['Save', 'Cancel', 'Apply', 'Finish', 'Clear', 'Done', 'Start', 'Continue', 'Submit', 'Delete', 'Edit', 'View', 'Download', 'Upload', 'Search'];

  const buttonComponents = [
    { name: 'Button1', component: Button1, type: 'Kids', description: 'Gradient with pulse animation' },
    { name: 'Button2', component: Button2, type: 'Kids', description: 'Border with shimmer effect' },
    { name: 'Button3', component: Button3, type: 'Kids', description: 'Press effect with shadow' },
    { name: 'Button4', component: Button4, type: 'Kids', description: 'Gradient with bounce animation' },
    { name: 'Button5', component: Button5, type: 'Kids', description: 'Rounded with border animation' },
    { name: 'Button6', component: Button6, type: 'Kids', description: 'Gradient with rotate effect' },
    { name: 'Button7', component: Button7, type: 'Kids', description: 'Overlay animation effect' },
    { name: 'Button8', component: Button8, type: 'Kids', description: 'Rounded full with scale' },
    { name: 'Button9', component: Button9, type: 'Kids', description: 'Gradient with bounce' },
    { name: 'Button10', component: Button10, type: 'Kids', description: 'Gradient with rotate hover' },
    { name: 'Button11', component: Button11, type: 'Professional', description: 'Solid professional style' },
    { name: 'Button12', component: Button12, type: 'Professional', description: 'Outline professional style' },
    { name: 'Button13', component: Button13, type: 'Professional', description: 'Gradient with scale' },
    { name: 'Button14', component: Button14, type: 'Professional', description: 'Solid corporate style' },
    { name: 'Button15', component: Button15, type: 'Professional', description: 'Light background style' },
    { name: 'Button16', component: Button16, type: 'Professional', description: 'Solid with rounded corners' },
    { name: 'Button17', component: Button17, type: 'Professional', description: 'Outline neutral style' },
    { name: 'Button18', component: Button18, type: 'Professional', description: 'Solid action style' },
    { name: 'Button19', component: Button19, type: 'Professional', description: 'Dark theme style' },
    { name: 'Button20', component: Button20, type: 'Professional', description: 'Light outline style' },
  ];

  const handleButtonClick = async (buttonName: string) => {
    setLoading(prev => ({ ...prev, [buttonName]: true }));
    try {
      // Simulate API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demo/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: selectedAction, 
          button: buttonName,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      alert(`${selectedAction} action completed successfully with ${buttonName}!`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`${selectedAction} action simulated successfully with ${buttonName}!`);
    } finally {
      setLoading(prev => ({ ...prev, [buttonName]: false }));
    }
  };

  return (
    <Container fluid className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-100 tw-py-8">
      <Container>
        <div className="tw-text-center tw-mb-8">
          <h1 className="tw-text-4xl tw-font-bold tw-text-purple-600 tw-mb-2">
            20 Dynamic Button Templates
          </h1>
          <p className="tw-text-lg tw-text-gray-600">
            🎨 Colors & Icons Adapt to Actions - 10 Kids + 10 Professional Templates
          </p>
        </div>

        {/* Global Action Control */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">🎛️ Global Action Control</h5>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <Row>
                  <Col md={6}>
                    <Form.Group className="tw-mb-4">
                      <Form.Label className="tw-font-medium tw-text-gray-700">
                        Select Action (changes all buttons):
                      </Form.Label>
                      <Form.Select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg"
                      >
                        {actions.map((action) => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <div className="tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                      <h6 className="tw-font-semibold tw-text-gray-700 tw-mb-2">Current Settings:</h6>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-1">
                        <strong>Action:</strong> {selectedAction}
                      </p>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-1">
                        <strong>Color Scheme:</strong> {getActionColors(selectedAction).primary}
                      </p>
                      <p className="tw-text-sm tw-text-gray-600">
                        <strong>Icon:</strong> Dynamic based on action
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Examples */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-green-500 tw-to-teal-500 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">🌈 Action Color Preview</h5>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <p className="tw-text-gray-600 tw-mb-4">
                  See how different actions automatically get different colors and icons:
                </p>
                <Row>
                  {['Save', 'Cancel', 'Delete', 'Edit', 'View', 'Done'].map((action) => {
                    const colors = getActionColors(action);
                    const icon = getActionIcon(action);
                    return (
                      <Col md={6} lg={4} xl={2} className="tw-mb-4" key={action}>
                        <div className="tw-text-center tw-p-3 tw-bg-white tw-rounded-lg tw-shadow-sm tw-border">
                          <h6 className="tw-font-semibold tw-text-gray-700 tw-mb-2 tw-text-sm">{action}</h6>
                          <div 
                            className="tw-w-8 tw-h-8 tw-rounded tw-mx-auto tw-mb-2"
                            style={{ backgroundColor: colors.primary }}
                          ></div>
                          <Button11
                            action={action}
                            onClick={() => handleButtonClick(`${action}-demo`)}
                            loading={loading[`${action}-demo`]}
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
                <div className="tw-mt-4 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                  <h6 className="tw-font-semibold tw-text-blue-700 tw-mb-2">🎨 Smart Color Mapping:</h6>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-3 tw-text-sm">
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-green-500 tw-rounded tw-mr-2"></div>
                      <span>Save, Done, Finish → Green</span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-red-500 tw-rounded tw-mr-2"></div>
                      <span>Delete → Red</span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-gray-500 tw-rounded tw-mr-2"></div>
                      <span>Cancel, Search → Gray</span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-yellow-500 tw-rounded tw-mr-2"></div>
                      <span>Edit, Clear → Yellow</span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-blue-500 tw-rounded tw-mr-2"></div>
                      <span>View, Download → Blue</span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-4 tw-h-4 tw-bg-purple-500 tw-rounded tw-mr-2"></div>
                      <span>Apply, Start, Submit → Purple</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Kids Buttons Section */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-pink-500 tw-to-purple-500 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">🎨 Kids Templates (Colorful & Playful)</h5>
                <p className="tw-text-sm tw-opacity-90 tw-mb-0">Perfect for learning platform - engaging animations and bright colors</p>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <Row>
                  {buttonComponents.filter(btn => btn.type === 'Kids').map((btnData) => {
                    const ButtonComponent = btnData.component;
                    
                    return (
                      <Col md={6} lg={4} xl={3} className="tw-mb-6" key={btnData.name}>
                        <Card className="tw-h-full tw-shadow-md tw-border-0 tw-bg-gradient-to-br tw-from-yellow-50 tw-to-pink-50">
                          <Card.Body className="tw-text-center tw-p-4">
                            <h6 className="tw-font-semibold tw-mb-2 tw-text-purple-600">{btnData.name}</h6>
                            <p className="tw-text-xs tw-text-gray-500 tw-mb-3">{btnData.description}</p>
                            <div className="tw-mb-3">
                              <ButtonComponent 
                                action={selectedAction} 
                                onClick={() => handleButtonClick(btnData.name)}
                                loading={loading[btnData.name]}
                              />
                            </div>
                            <div className="tw-text-xs tw-text-gray-400">
                              Auto colors & icons
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Professional Buttons Section */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-gray-600 tw-to-purple-600 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">💼 Professional Templates (Clean & Modern)</h5>
                <p className="tw-text-sm tw-opacity-90 tw-mb-0">Perfect for CRM/Admin - clean design with professional appeal</p>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <Row>
                  {buttonComponents.filter(btn => btn.type === 'Professional').map((btnData) => {
                    const ButtonComponent = btnData.component;
                    
                    return (
                      <Col md={6} lg={4} xl={3} className="tw-mb-6" key={btnData.name}>
                        <Card className="tw-h-full tw-shadow-md tw-border-0 tw-bg-gray-50">
                          <Card.Body className="tw-text-center tw-p-4">
                            <h6 className="tw-font-semibold tw-mb-2 tw-text-purple-600">{btnData.name}</h6>
                            <p className="tw-text-xs tw-text-gray-500 tw-mb-3">{btnData.description}</p>
                            <div className="tw-mb-3">
                              <ButtonComponent 
                                action={selectedAction} 
                                onClick={() => handleButtonClick(btnData.name)}
                                loading={loading[btnData.name]}
                              />
                            </div>
                            <div className="tw-text-xs tw-text-gray-400">
                              Auto colors & icons
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Button States Demo */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">🔄 Button States Demo</h5>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <p className="tw-text-gray-600 tw-mb-4">
                  All button templates support these states:
                </p>
                <Row>
                  <Col md={4} className="tw-mb-4">
                    <div className="tw-text-center tw-p-4 tw-bg-green-50 tw-rounded-lg">
                      <h6 className="tw-font-semibold tw-text-green-600 tw-mb-3">Normal State</h6>
                      <Button1 action={selectedAction} onClick={() => handleButtonClick('demo-normal')} />
                    </div>
                  </Col>
                  <Col md={4} className="tw-mb-4">
                    <div className="tw-text-center tw-p-4 tw-bg-yellow-50 tw-rounded-lg">
                      <h6 className="tw-font-semibold tw-text-yellow-600 tw-mb-3">Loading State</h6>
                      <Button11 action={selectedAction} loading={true} onClick={() => {}} />
                    </div>
                  </Col>
                  <Col md={4} className="tw-mb-4">
                    <div className="tw-text-center tw-p-4 tw-bg-red-50 tw-rounded-lg">
                      <h6 className="tw-font-semibold tw-text-red-600 tw-mb-3">Disabled State</h6>
                      <Button6 action={selectedAction} disabled={true} onClick={() => {}} />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Implementation Guide */}
        <Row className="tw-mb-8">
          <Col>
            <Card className="tw-shadow-xl tw-border-0">
              <Card.Header className="tw-bg-gradient-to-r tw-from-green-500 tw-to-teal-500 tw-text-white">
                <h5 className="tw-mb-0 tw-font-semibold">📋 Implementation Guide</h5>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <Row>
                  <Col md={6}>
                    <div className="tw-mb-4">
                      <h6 className="tw-font-semibold tw-text-gray-700 tw-mb-2">Simple Usage:</h6>
                      <pre className="tw-bg-gray-100 tw-p-3 tw-rounded tw-text-sm tw-overflow-x-auto">
{`<Button1
  action="Save"
  onClick={handleSave}
  loading={isSaving}
  disabled={formInvalid}
/>`}
                      </pre>
                      <p className="tw-text-sm tw-text-gray-600 tw-mt-2">
                        Colors and icons automatically adapt based on the action prop!
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="tw-mb-4">
                      <h6 className="tw-font-semibold tw-text-gray-700 tw-mb-2">Props Interface:</h6>
                      <pre className="tw-bg-gray-100 tw-p-3 tw-rounded tw-text-sm tw-overflow-x-auto">
{`interface ButtonProps {
  action: string;      // Button text
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}`}
                      </pre>
                      <p className="tw-text-sm tw-text-gray-600 tw-mt-2">
                        Clean and simple - just pass the action name!
                      </p>
                    </div>
                  </Col>
                </Row>
                <div className="tw-mt-4 tw-p-4 tw-bg-purple-50 tw-rounded-lg">
                  <h6 className="tw-font-semibold tw-text-purple-700 tw-mb-2">✨ Key Features:</h6>
                  <ul className="tw-list-disc tw-list-inside tw-text-purple-600 tw-space-y-1 tw-text-sm">
                    <li><strong>Smart Color System:</strong> Each action gets contextually appropriate colors</li>
                    <li><strong>Dynamic Icons:</strong> Icons automatically change based on action type</li>
                    <li><strong>Unique Styles:</strong> Each button maintains its distinctive design personality</li>
                    <li><strong>Consistent Behavior:</strong> All buttons support loading and disabled states</li>
                    <li><strong>Action Variants:</strong> Delete→Red, Save→Green, Edit→Yellow, etc.</li>
                    <li><strong>Kids vs Professional:</strong> Two style categories for different audiences</li>
                  </ul>
                </div>
                <div className="tw-mt-4 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                  <h6 className="tw-font-semibold tw-text-blue-700 tw-mb-2">🎯 Perfect For:</h6>
                  <Row>
                    <Col md={6}>
                      <p className="tw-text-sm tw-font-medium tw-text-blue-600 tw-mb-1">Kids Templates (1-10):</p>
                      <ul className="tw-text-xs tw-text-blue-600 tw-list-disc tw-list-inside">
                        <li>Learning management system</li>
                        <li>Student interfaces</li>
                        <li>Gamified applications</li>
                        <li>Interactive educational content</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <p className="tw-text-sm tw-font-medium tw-text-blue-600 tw-mb-1">Professional Templates (11-20):</p>
                      <ul className="tw-text-xs tw-text-blue-600 tw-list-disc tw-list-inside">
                        <li>CRM dashboards</li>
                        <li>Admin panels</li>
                        <li>Business applications</li>
                        <li>Data management interfaces</li>
                      </ul>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="tw-text-center tw-mt-8">
          <p className="tw-text-gray-500 tw-text-sm">
            🚀 Ready to use! Each button automatically adapts colors and icons based on the action prop while maintaining its unique style.
          </p>
        </div>
      </Container>
    </Container>
  );
};

export default ButtonDemo;