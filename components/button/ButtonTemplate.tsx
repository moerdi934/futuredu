// components/button/ButtonTemplate.tsx
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { 
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
  XCircle,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Volume2,
  Home,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Copy,
  Share,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  Send,
  ShoppingCart,
  CreditCard,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  UserPlus,
  Users,
  Bell,
  Bookmark,
  Flag,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Globe,
  Wifi,
  Smartphone,
  Monitor,
  Camera,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  MicOff,
  VolumeX,
  Maximize,
  Minimize,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  Grid3X3,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Unlink,
  Archive,
  Trash,
  RestoreWindow,
  FolderPlus,
  FilePlus,
  Database,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Zap,
  Battery,
  WifiOff,
  Bluetooth,
  USB
} from 'lucide-react';

// Comprehensive action types with categories
export type ActionType = 
  // Basic Actions
  | 'save' | 'cancel' | 'apply' | 'finish' | 'clear' | 'done' | 'start' | 'continue' | 'submit' 
  | 'delete' | 'edit' | 'view' | 'download' | 'upload' | 'search' | 'filter' | 'refresh' | 'copy'
  | 'share' | 'back' | 'forward' | 'home' | 'close' | 'open' | 'create' | 'add' | 'remove'
  
  // User Actions  
  | 'login' | 'logout' | 'register' | 'profile' | 'account' | 'settings' | 'preferences'
  | 'invite' | 'follow' | 'unfollow' | 'block' | 'unblock' | 'report'
  
  // Content Actions
  | 'like' | 'unlike' | 'favorite' | 'unfavorite' | 'bookmark' | 'unbookmark' 
  | 'comment' | 'reply' | 'quote' | 'repost' | 'rate' | 'review'
  
  // Media Actions
  | 'play' | 'pause' | 'stop' | 'next' | 'previous' | 'record' | 'mute' | 'unmute'
  | 'fullscreen' | 'minimize' | 'maximize' | 'zoom-in' | 'zoom-out' | 'rotate'
  | 'capture' | 'gallery' | 'camera' | 'video' | 'audio'
  
  // Commerce Actions
  | 'buy' | 'sell' | 'cart' | 'checkout' | 'payment' | 'order' | 'invoice' | 'receipt'
  | 'refund' | 'return' | 'exchange' | 'wishlist' | 'compare'
  
  // Data Actions
  | 'export' | 'import' | 'backup' | 'restore' | 'sync' | 'connect' | 'disconnect'
  | 'archive' | 'unarchive' | 'sort' | 'group' | 'merge' | 'split'
  
  // Communication
  | 'call' | 'message' | 'email' | 'chat' | 'notify' | 'alert' | 'announce'
  | 'subscribe' | 'unsubscribe' | 'broadcast'
  
  // Navigation
  | 'menu' | 'sidebar' | 'navigate' | 'redirect' | 'link' | 'unlink' | 'external'
  
  // System Actions
  | 'install' | 'uninstall' | 'update' | 'upgrade' | 'configure' | 'reset' | 'restart'
  | 'enable' | 'disable' | 'activate' | 'deactivate' | 'lock' | 'unlock'
  
  // Custom
  | 'custom';

export interface ButtonTemplateProps {
  action: ActionType;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  customText?: string;
  customIcon?: React.ReactNode;
  customColors?: {
    primary?: string;
    secondary?: string;
    light?: string;
    dark?: string;
    gradient1?: string;
    gradient2?: string;
    border?: string;
    text?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

// Comprehensive color schemes for all actions
const getActionColors = (action: ActionType) => {
  const colorSchemes: Record<ActionType, any> = {
    // Basic Actions - Green family
    'save': { primary: '#10B981', secondary: '#059669', light: '#D1FAE5', dark: '#047857', gradient1: '#10B981', gradient2: '#059669', border: '#047857', text: '#FFFFFF' },
    'done': { primary: '#10B981', secondary: '#059669', light: '#ECFDF5', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'finish': { primary: '#059669', secondary: '#047857', light: '#D1FAE5', dark: '#065F46', gradient1: '#059669', gradient2: '#10B981', border: '#047857', text: '#FFFFFF' },
    'apply': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#EDE9FE', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#7C3AED', border: '#6D28D9', text: '#FFFFFF' },
    'submit': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'continue': { primary: '#06B6D4', secondary: '#0891B2', light: '#CFFAFE', dark: '#0E7490', gradient1: '#06B6D4', gradient2: '#0891B2', border: '#0E7490', text: '#FFFFFF' },
    'start': { primary: '#3B82F6', secondary: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8', gradient1: '#3B82F6', gradient2: '#2563EB', border: '#1D4ED8', text: '#FFFFFF' },
    'create': { primary: '#10B981', secondary: '#059669', light: '#D1FAE5', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'add': { primary: '#10B981', secondary: '#059669', light: '#D1FAE5', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    
    // Destructive Actions - Red family
    'delete': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'remove': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'cancel': { primary: '#6B7280', secondary: '#4B5563', light: '#F3F4F6', dark: '#374151', gradient1: '#6B7280', gradient2: '#4B5563', border: '#374151', text: '#FFFFFF' },
    'close': { primary: '#6B7280', secondary: '#4B5563', light: '#F3F4F6', dark: '#374151', gradient1: '#6B7280', gradient2: '#4B5563', border: '#374151', text: '#FFFFFF' },
    'clear': { primary: '#F59E0B', secondary: '#D97706', light: '#FEF3C7', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#D97706', border: '#B45309', text: '#FFFFFF' },
    'reset': { primary: '#F59E0B', secondary: '#D97706', light: '#FEF3C7', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#D97706', border: '#B45309', text: '#FFFFFF' },
    'logout': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    
    // Warning Actions - Yellow family
    'edit': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'update': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'upgrade': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'configure': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    
    // Info Actions - Blue family
    'view': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'download': { primary: '#06B6D4', secondary: '#0891B2', light: '#F0F9FF', dark: '#0E7490', gradient1: '#06B6D4', gradient2: '#22D3EE', border: '#0891B2', text: '#FFFFFF' },
    'upload': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'search': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'filter': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F9FAFB', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'refresh': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'sync': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'connect': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'disconnect': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    
    // User Actions - Purple family
    'login': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'register': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'profile': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'account': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'settings': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'preferences': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'invite': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    
    // Custom - Default purple
    'custom': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },

    // ... (semua color schemes lainnya sama seperti sebelumnya)
    'like': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#F87171', border: '#DC2626', text: '#FFFFFF' },
    'unlike': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'favorite': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'unfavorite': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'bookmark': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'unbookmark': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'share': { primary: '#06B6D4', secondary: '#0891B2', light: '#F0F9FF', dark: '#0E7490', gradient1: '#06B6D4', gradient2: '#22D3EE', border: '#0891B2', text: '#FFFFFF' },
    'copy': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'comment': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'reply': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'quote': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'repost': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'rate': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'review': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    
    // Media Actions
    'play': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'pause': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'stop': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'next': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'previous': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'record': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#F87171', border: '#DC2626', text: '#FFFFFF' },
    'mute': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'unmute': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'fullscreen': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'minimize': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'maximize': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'zoom-in': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'zoom-out': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'rotate': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'capture': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'gallery': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'camera': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'video': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#F87171', border: '#DC2626', text: '#FFFFFF' },
    'audio': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },

    // Commerce Actions
    'buy': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'sell': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'cart': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'checkout': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'payment': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'order': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'invoice': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'receipt': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'refund': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'return': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'exchange': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'wishlist': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#F87171', border: '#DC2626', text: '#FFFFFF' },
    'compare': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },

    // Navigation Actions
    'home': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'back': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'forward': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'menu': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'sidebar': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'navigate': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'redirect': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'link': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'unlink': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'external': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    
    // Data Actions
    'export': { primary: '#06B6D4', secondary: '#0891B2', light: '#F0F9FF', dark: '#0E7490', gradient1: '#06B6D4', gradient2: '#22D3EE', border: '#0891B2', text: '#FFFFFF' },
    'import': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'backup': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'restore': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'archive': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'unarchive': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'sort': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'group': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'merge': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'split': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    
    // Communication Actions
    'call': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'message': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'email': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'chat': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'notify': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'alert': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#F87171', border: '#DC2626', text: '#FFFFFF' },
    'announce': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    'subscribe': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'unsubscribe': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'broadcast': { primary: '#8B5CF6', secondary: '#7C3AED', light: '#F3E8FF', dark: '#6D28D9', gradient1: '#8B5CF6', gradient2: '#A855F7', border: '#7C3AED', text: '#FFFFFF' },
    
    // System Actions
    'install': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'uninstall': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'restart': { primary: '#F59E0B', secondary: '#D97706', light: '#FFFBEB', dark: '#B45309', gradient1: '#F59E0B', gradient2: '#FBBF24', border: '#D97706', text: '#FFFFFF' },
    'enable': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'disable': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'activate': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'deactivate': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'lock': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'unlock': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    
    // Misc Actions
    'open': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'follow': { primary: '#3B82F6', secondary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF', gradient1: '#3B82F6', gradient2: '#60A5FA', border: '#2563EB', text: '#FFFFFF' },
    'unfollow': { primary: '#6B7280', secondary: '#4B5563', light: '#F9FAFB', dark: '#374151', gradient1: '#6B7280', gradient2: '#9CA3AF', border: '#4B5563', text: '#FFFFFF' },
    'block': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
    'unblock': { primary: '#10B981', secondary: '#059669', light: '#F0FDF4', dark: '#047857', gradient1: '#10B981', gradient2: '#34D399', border: '#059669', text: '#FFFFFF' },
    'report': { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', gradient1: '#EF4444', gradient2: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },
  };

  return colorSchemes[action] || colorSchemes.custom;
};

// Get appropriate icon for action
const getActionIcon = (action: ActionType) => {
  const iconMap: Record<ActionType, React.ReactNode> = {
    // Basic Actions
    'save': <Save className="tw-w-4 tw-h-4" />,
    'cancel': <X className="tw-w-4 tw-h-4" />,
    'apply': <Check className="tw-w-4 tw-h-4" />,
    'finish': <CheckCircle className="tw-w-4 tw-h-4" />,
    'clear': <XCircle className="tw-w-4 tw-h-4" />,
    'done': <CheckCircle className="tw-w-4 tw-h-4" />,
    'start': <Play className="tw-w-4 tw-h-4" />,
    'continue': <Play className="tw-w-4 tw-h-4" />,
    'submit': <Upload className="tw-w-4 tw-h-4" />,
    'delete': <Trash2 className="tw-w-4 tw-h-4" />,
    'edit': <Edit className="tw-w-4 tw-h-4" />,
    'view': <Eye className="tw-w-4 tw-h-4" />,
    'download': <Download className="tw-w-4 tw-h-4" />,
    'upload': <Upload className="tw-w-4 tw-h-4" />,
    'search': <Search className="tw-w-4 tw-h-4" />,
    'filter': <Filter className="tw-w-4 tw-h-4" />,
    'refresh': <RefreshCw className="tw-w-4 tw-h-4" />,
    'copy': <Copy className="tw-w-4 tw-h-4" />,
    'share': <Share className="tw-w-4 tw-h-4" />,
    'back': <ArrowLeft className="tw-w-4 tw-h-4" />,
    'forward': <ArrowRight className="tw-w-4 tw-h-4" />,
    'home': <Home className="tw-w-4 tw-h-4" />,
    'close': <X className="tw-w-4 tw-h-4" />,
    'open': <ExternalLink className="tw-w-4 tw-h-4" />,
    'create': <Plus className="tw-w-4 tw-h-4" />,
    'add': <Plus className="tw-w-4 tw-h-4" />,
    'remove': <Trash2 className="tw-w-4 tw-h-4" />,
    
    // User Actions
    'login': <LogIn className="tw-w-4 tw-h-4" />,
    'logout': <LogOut className="tw-w-4 tw-h-4" />,
    'register': <UserPlus className="tw-w-4 tw-h-4" />,
    'profile': <User className="tw-w-4 tw-h-4" />,
    'account': <User className="tw-w-4 tw-h-4" />,
    'settings': <Settings className="tw-w-4 tw-h-4" />,
    'preferences': <Settings className="tw-w-4 tw-h-4" />,
    'invite': <UserPlus className="tw-w-4 tw-h-4" />,
    'follow': <UserPlus className="tw-w-4 tw-h-4" />,
    'unfollow': <Users className="tw-w-4 tw-h-4" />,
    'block': <X className="tw-w-4 tw-h-4" />,
    'unblock': <Check className="tw-w-4 tw-h-4" />,
    'report': <Flag className="tw-w-4 tw-h-4" />,
    
    // Content Actions
    'like': <Heart className="tw-w-4 tw-h-4" />,
    'unlike': <Heart className="tw-w-4 tw-h-4" />,
    'favorite': <Star className="tw-w-4 tw-h-4" />,
    'unfavorite': <Star className="tw-w-4 tw-h-4" />,
    'bookmark': <Bookmark className="tw-w-4 tw-h-4" />,
    'unbookmark': <Bookmark className="tw-w-4 tw-h-4" />,
    'comment': <MessageCircle className="tw-w-4 tw-h-4" />,
    'reply': <MessageCircle className="tw-w-4 tw-h-4" />,
    'quote': <MessageCircle className="tw-w-4 tw-h-4" />,
    'repost': <RefreshCw className="tw-w-4 tw-h-4" />,
    'rate': <Star className="tw-w-4 tw-h-4" />,
    'review': <Star className="tw-w-4 tw-h-4" />,
    
    // Media Actions
    'play': <Play className="tw-w-4 tw-h-4" />,
    'pause': <Pause className="tw-w-4 tw-h-4" />,
    'stop': <Stop className="tw-w-4 tw-h-4" />,
    'next': <SkipForward className="tw-w-4 tw-h-4" />,
    'previous': <SkipBack className="tw-w-4 tw-h-4" />,
    'record': <Mic className="tw-w-4 tw-h-4" />,
    'mute': <VolumeX className="tw-w-4 tw-h-4" />,
    'unmute': <Volume2 className="tw-w-4 tw-h-4" />,
    'fullscreen': <Maximize className="tw-w-4 tw-h-4" />,
    'minimize': <Minimize className="tw-w-4 tw-h-4" />,
    'maximize': <Maximize className="tw-w-4 tw-h-4" />,
    'zoom-in': <ZoomIn className="tw-w-4 tw-h-4" />,
    'zoom-out': <ZoomOut className="tw-w-4 tw-h-4" />,
    'rotate': <RotateCw className="tw-w-4 tw-h-4" />,
    'capture': <Camera className="tw-w-4 tw-h-4" />,
    'gallery': <Image className="tw-w-4 tw-h-4" />,
    'camera': <Camera className="tw-w-4 tw-h-4" />,
    'video': <Video className="tw-w-4 tw-h-4" />,
    'audio': <Music className="tw-w-4 tw-h-4" />,
    
    // Commerce Actions
    'buy': <ShoppingCart className="tw-w-4 tw-h-4" />,
    'sell': <ShoppingCart className="tw-w-4 tw-h-4" />,
    'cart': <ShoppingCart className="tw-w-4 tw-h-4" />,
    'checkout': <CreditCard className="tw-w-4 tw-h-4" />,
    'payment': <CreditCard className="tw-w-4 tw-h-4" />,
    'order': <FileText className="tw-w-4 tw-h-4" />,
    'invoice': <FileText className="tw-w-4 tw-h-4" />,
    'receipt': <FileText className="tw-w-4 tw-h-4" />,
    'refund': <RefreshCw className="tw-w-4 tw-h-4" />,
    'return': <RefreshCw className="tw-w-4 tw-h-4" />,
    'exchange': <RefreshCw className="tw-w-4 tw-h-4" />,
    'wishlist': <Heart className="tw-w-4 tw-h-4" />,
    'compare': <BarChart3 className="tw-w-4 tw-h-4" />,
    
    // Data Actions
    'export': <Download className="tw-w-4 tw-h-4" />,
    'import': <Upload className="tw-w-4 tw-h-4" />,
    'backup': <Database className="tw-w-4 tw-h-4" />,
    'restore': <RefreshCw className="tw-w-4 tw-h-4" />,
    'sync': <RefreshCw className="tw-w-4 tw-h-4" />,
    'connect': <Wifi className="tw-w-4 tw-h-4" />,
    'disconnect': <WifiOff className="tw-w-4 tw-h-4" />,
    'archive': <Archive className="tw-w-4 tw-h-4" />,
    'unarchive': <Archive className="tw-w-4 tw-h-4" />,
    'sort': <BarChart3 className="tw-w-4 tw-h-4" />,
    'group': <Grid3X3 className="tw-w-4 tw-h-4" />,
    'merge': <Layers className="tw-w-4 tw-h-4" />,
    'split': <Layers className="tw-w-4 tw-h-4" />,
    
    // Communication
    'call': <Phone className="tw-w-4 tw-h-4" />,
    'message': <MessageCircle className="tw-w-4 tw-h-4" />,
    'email': <Mail className="tw-w-4 tw-h-4" />,
    'chat': <MessageCircle className="tw-w-4 tw-h-4" />,
    'notify': <Bell className="tw-w-4 tw-h-4" />,
    'alert': <AlertCircle className="tw-w-4 tw-h-4" />,
    'announce': <Bell className="tw-w-4 tw-h-4" />,
    'subscribe': <Bell className="tw-w-4 tw-h-4" />,
    'unsubscribe': <Bell className="tw-w-4 tw-h-4" />,
    'broadcast': <Bell className="tw-w-4 tw-h-4" />,
    
    // Navigation
    'menu': <Menu className="tw-w-4 tw-h-4" />,
    'sidebar': <Menu className="tw-w-4 tw-h-4" />,
    'navigate': <MapPin className="tw-w-4 tw-h-4" />,
    'redirect': <ExternalLink className="tw-w-4 tw-h-4" />,
    'link': <Link className="tw-w-4 tw-h-4" />,
    'unlink': <Unlink className="tw-w-4 tw-h-4" />,
    'external': <ExternalLink className="tw-w-4 tw-h-4" />,
    
    // System Actions
    'install': <Download className="tw-w-4 tw-h-4" />,
    'uninstall': <Trash2 className="tw-w-4 tw-h-4" />,
    'update': <RefreshCw className="tw-w-4 tw-h-4" />,
    'upgrade': <TrendingUp className="tw-w-4 tw-h-4" />,
    'configure': <Settings className="tw-w-4 tw-h-4" />,
    'reset': <RefreshCw className="tw-w-4 tw-h-4" />,
    'restart': <RefreshCw className="tw-w-4 tw-h-4" />,
    'enable': <Check className="tw-w-4 tw-h-4" />,
    'disable': <X className="tw-w-4 tw-h-4" />,
    'activate': <Check className="tw-w-4 tw-h-4" />,
    'deactivate': <X className="tw-w-4 tw-h-4" />,
    'lock': <Lock className="tw-w-4 tw-h-4" />,
    'unlock': <Unlock className="tw-w-4 tw-h-4" />,
    
    // Custom
    'custom': <AlertCircle className="tw-w-4 tw-h-4" />,
  };

  return iconMap[action] || <AlertCircle className="tw-w-4 tw-h-4" />;
};

// Get display text for action
const getActionText = (action: ActionType, customText?: string) => {
  if (customText) return customText;
  
  const textMap: Record<ActionType, string> = {
    // Basic Actions
    'save': 'Save', 'cancel': 'Cancel', 'apply': 'Apply', 'finish': 'Finish', 'clear': 'Clear', 
    'done': 'Done', 'start': 'Start', 'continue': 'Continue', 'submit': 'Submit', 'delete': 'Delete',
    'edit': 'Edit', 'view': 'View', 'download': 'Download', 'upload': 'Upload', 'search': 'Search',
    'filter': 'Filter', 'refresh': 'Refresh', 'copy': 'Copy', 'share': 'Share', 'back': 'Back',
    'forward': 'Forward', 'home': 'Home', 'close': 'Close', 'open': 'Open', 'create': 'Create',
    'add': 'Add', 'remove': 'Remove',
    
    // User Actions
    'login': 'Login', 'logout': 'Logout', 'register': 'Register', 'profile': 'Profile',
    'account': 'Account', 'settings': 'Settings', 'preferences': 'Preferences', 'invite': 'Invite',
    'follow': 'Follow', 'unfollow': 'Unfollow', 'block': 'Block', 'unblock': 'Unblock', 'report': 'Report',
    
    // Content Actions
    'like': 'Like', 'unlike': 'Unlike', 'favorite': 'Favorite', 'unfavorite': 'Unfavorite',
    'bookmark': 'Bookmark', 'unbookmark': 'Unbookmark', 'comment': 'Comment', 'reply': 'Reply',
    'quote': 'Quote', 'repost': 'Repost', 'rate': 'Rate', 'review': 'Review',
    
    // Media Actions
    'play': 'Play', 'pause': 'Pause', 'stop': 'Stop', 'next': 'Next', 'previous': 'Previous',
    'record': 'Record', 'mute': 'Mute', 'unmute': 'Unmute', 'fullscreen': 'Fullscreen',
    'minimize': 'Minimize', 'maximize': 'Maximize', 'zoom-in': 'Zoom In', 'zoom-out': 'Zoom Out',
    'rotate': 'Rotate', 'capture': 'Capture', 'gallery': 'Gallery', 'camera': 'Camera',
    'video': 'Video', 'audio': 'Audio',
    
    // Commerce Actions
    'buy': 'Buy', 'sell': 'Sell', 'cart': 'Cart', 'checkout': 'Checkout', 'payment': 'Payment',
    'order': 'Order', 'invoice': 'Invoice', 'receipt': 'Receipt', 'refund': 'Refund',
    'return': 'Return', 'exchange': 'Exchange', 'wishlist': 'Wishlist', 'compare': 'Compare',
    
    // Data Actions
    'export': 'Export', 'import': 'Import', 'backup': 'Backup', 'restore': 'Restore',
    'sync': 'Sync', 'connect': 'Connect', 'disconnect': 'Disconnect', 'archive': 'Archive',
    'unarchive': 'Unarchive', 'sort': 'Sort', 'group': 'Group', 'merge': 'Merge', 'split': 'Split',
    
    // Communication
    'call': 'Call', 'message': 'Message', 'email': 'Email', 'chat': 'Chat', 'notify': 'Notify',
    'alert': 'Alert', 'announce': 'Announce', 'subscribe': 'Subscribe', 'unsubscribe': 'Unsubscribe',
    'broadcast': 'Broadcast',
    
    // Navigation
    'menu': 'Menu', 'sidebar': 'Sidebar', 'navigate': 'Navigate', 'redirect': 'Redirect',
    'link': 'Link', 'unlink': 'Unlink', 'external': 'External',
    
    // System Actions
    'install': 'Install', 'uninstall': 'Uninstall', 'update': 'Update', 'upgrade': 'Upgrade',
    'configure': 'Configure', 'reset': 'Reset', 'restart': 'Restart', 'enable': 'Enable',
    'disable': 'Disable', 'activate': 'Activate', 'deactivate': 'Deactivate', 'lock': 'Lock',
    'unlock': 'Unlock',
    
    // Custom
    'custom': 'Custom',
  };

  return textMap[action] || 'Action';
};

// Size configurations dengan support untuk icon-only mode
const getSizeClasses = (size: 'sm' | 'md' | 'lg', showText: boolean = true) => {
  if (!showText) {
    // Icon-only mode
    const iconOnlySizeMap = {
      'sm': { 
        padding: 'tw-p-2', 
        text: 'tw-text-sm', 
        icon: 'tw-w-4 tw-h-4',
        width: 'tw-w-8 tw-h-8',
        gap: ''
      },
      'md': { 
        padding: 'tw-p-2.5', 
        text: 'tw-text-base', 
        icon: 'tw-w-4 tw-h-4',
        width: 'tw-w-10 tw-h-10',
        gap: ''
      },
      'lg': { 
        padding: 'tw-p-3', 
        text: 'tw-text-lg', 
        icon: 'tw-w-5 tw-h-5',
        width: 'tw-w-12 tw-h-12',
        gap: ''
      },
    };
    return iconOnlySizeMap[size];
  }

  // Normal mode with text
  const sizeMap = {
    'sm': { 
      padding: 'tw-px-3 tw-py-2', 
      text: 'tw-text-sm', 
      icon: 'tw-w-4 tw-h-4',
      width: 'tw-min-w-[100px]',
      gap: 'tw-gap-2'
    },
    'md': { 
      padding: 'tw-px-4 tw-py-3', 
      text: 'tw-text-base', 
      icon: 'tw-w-4 tw-h-4',
      width: 'tw-min-w-[120px]',
      gap: 'tw-gap-2'
    },
    'lg': { 
      padding: 'tw-px-6 tw-py-4', 
      text: 'tw-text-lg', 
      icon: 'tw-w-5 tw-h-5',
      width: 'tw-min-w-[140px]',
      gap: 'tw-gap-3'
    },
  };
  return sizeMap[size];
};

// Button Template 1 - ButtonGradient dengan ForwardRef
export const ButtonGradient = forwardRef<HTMLButtonElement, ButtonTemplateProps>(({ 
  action, 
  onClick, 
  disabled, 
  loading, 
  customText, 
  customIcon, 
  customColors, 
  size = 'md',
  className = '',
  showText = true,
  children
}, ref) => {
  const colors = customColors || getActionColors(action);
  const icon = customIcon || getActionIcon(action);
  const text = getActionText(action, customText);
  const sizeClasses = getSizeClasses(size, showText);
  
  return (
    <button
      ref={ref}
      className={`
        tw-group 
        ${sizeClasses.padding} 
        ${showText ? sizeClasses.width : `${sizeClasses.width} tw-flex-shrink-0`}
        tw-font-bold 
        tw-rounded-xl 
        tw-shadow-lg 
        tw-transform 
        tw-transition 
        tw-duration-300 
        hover:tw-scale-105 
        disabled:tw-opacity-50 
        disabled:tw-cursor-not-allowed 
        tw-relative 
        tw-overflow-hidden 
        ${sizeClasses.text}
        tw-flex
        tw-items-center
        tw-justify-center
        ${showText ? sizeClasses.gap : ''}
        ${showText ? 'tw-whitespace-nowrap' : ''}
        focus:tw-outline-none
        focus:tw-ring-2
        focus:tw-ring-offset-2
        tw-focus:tw-ring-opacity-50
        ${className}
      `}
      onClick={(e) => {
        console.log('ButtonGradient onClick - event:', e);
        console.log('ButtonGradient onClick - currentTarget:', e.currentTarget);
        onClick?.(e);
      }}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to bottom right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        focusRingColor: colors.primary + '50',
      }}
      aria-label={text}
    >
      <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-white tw-to-transparent tw-opacity-0 group-hover:tw-opacity-20 tw-transition tw-duration-300"></div>
      
      {children ? (
        <div className="tw-relative tw-z-10 tw-flex tw-items-center tw-justify-center">
          {children}
        </div>
      ) : (
        <>
          <div 
            className="tw-relative tw-z-10 tw-flex tw-items-center tw-justify-center"
            style={{ 
              animation: loading ? 'bounce 2s infinite' : 'none' 
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { 
              className: `${sizeClasses.icon} tw-flex-shrink-0` 
            })}
          </div>
          {showText && (
            <span className="tw-relative tw-z-10 tw-flex-shrink-0">
              {loading ? 'Loading...' : text}
            </span>
          )}
        </>
      )}
    </button>
  );
});

ButtonGradient.displayName = 'ButtonGradient';

// Button Template 2 - ButtonPlay dengan ForwardRef
export const ButtonPlay = forwardRef<HTMLButtonElement, ButtonTemplateProps>(({ 
  action, 
  onClick, 
  disabled, 
  loading, 
  customText, 
  customIcon, 
  customColors, 
  size = 'md',
  className = '',
  showText = true,
  children
}, ref) => {
  const colors = customColors || getActionColors(action);
  const icon = customIcon || getActionIcon(action);
  const text = getActionText(action, customText);
  const sizeClasses = getSizeClasses(size, showText);
  
  return (
    <button
      ref={ref}
      className={`
        ${sizeClasses.padding} 
        ${showText ? sizeClasses.width : `${sizeClasses.width} tw-flex-shrink-0`}
        tw-font-bold 
        tw-rounded-xl 
        tw-shadow-2xl 
        tw-transform 
        tw-transition 
        tw-duration-300 
        hover:tw-scale-105 
        disabled:tw-opacity-50 
        disabled:tw-cursor-not-allowed 
        ${sizeClasses.text}
        tw-flex
        tw-items-center
        tw-justify-center
        ${showText ? sizeClasses.gap : ''}
        ${showText ? 'tw-whitespace-nowrap' : ''}
        focus:tw-outline-none
        focus:tw-ring-2
        focus:tw-ring-offset-2
        tw-focus:tw-ring-opacity-50
        ${className}
      `}
      onClick={(e) => {
        console.log('ButtonPlay onClick - event:', e);
        console.log('ButtonPlay onClick - currentTarget:', e.currentTarget);
        onClick?.(e);
      }}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to bottom right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        boxShadow: `0 25px 50px -12px ${colors.primary}50`,
        animation: loading ? 'bounce 1s infinite' : 'none',
        focusRingColor: colors.primary + '50',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.secondary}50`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${colors.primary}50`;
        }
      }}
      aria-label={text}
    >
      {children ? (
        <div className="tw-flex tw-items-center tw-justify-center">
          {children}
        </div>
      ) : (
        <>
          <div className="tw-flex tw-items-center tw-justify-center">
            {React.cloneElement(icon as React.ReactElement, { 
              className: `${sizeClasses.icon} tw-flex-shrink-0` 
            })}
          </div>
          {showText && (
            <span className="tw-flex-shrink-0">
              {loading ? 'Loading...' : text}
            </span>
          )}
        </>
      )}
    </button>
  );
});

ButtonPlay.displayName = 'ButtonPlay';

// Button Template 3 - ButtonProfessional dengan ForwardRef
export const ButtonProfessional = forwardRef<HTMLButtonElement, ButtonTemplateProps>(({ 
  action, 
  onClick, 
  disabled, 
  loading, 
  customText, 
  customIcon, 
  customColors, 
  size = 'md',
  className = '',
  showText = true,
  children
}, ref) => {
  const colors = customColors || getActionColors(action);
  const icon = customIcon || getActionIcon(action);
  const text = getActionText(action, customText);
  const sizeClasses = getSizeClasses(size, showText);
  
  return (
    <button
      ref={ref}
      className={`
        ${sizeClasses.padding} 
        ${showText ? sizeClasses.width : `${sizeClasses.width} tw-flex-shrink-0`}
        tw-font-bold 
        tw-rounded-2xl 
        tw-shadow-xl 
        tw-transform 
        tw-transition 
        tw-duration-500 
        hover:tw-scale-110 
        hover:tw-rotate-3 
        disabled:tw-opacity-50 
        disabled:tw-cursor-not-allowed 
        tw-border-b-4 
        ${sizeClasses.text}
        tw-flex
        tw-items-center
        tw-justify-center
        ${showText ? sizeClasses.gap : ''}
        ${showText ? 'tw-whitespace-nowrap' : ''}
        focus:tw-outline-none
        focus:tw-ring-2
        focus:tw-ring-offset-2
        tw-focus:tw-ring-opacity-50
        ${className}
      `}
      onClick={(e) => {
        console.log('ButtonProfessional onClick - event:', e);
        console.log('ButtonProfessional onClick - currentTarget:', e.currentTarget);
        onClick?.(e);
      }}
      disabled={disabled || loading}
      style={{
        background: `linear-gradient(to right, ${colors.gradient1}, ${colors.gradient2})`,
        color: colors.text,
        borderBottomColor: colors.border,
        focusRingColor: colors.primary + '50',
      }}
      aria-label={text}
    >
      {children ? (
        <div className="tw-flex tw-items-center tw-justify-center">
          {children}
        </div>
      ) : (
        <>
          <div className="tw-flex tw-items-center tw-justify-center">
            {React.cloneElement(icon as React.ReactElement, { 
              className: `${sizeClasses.icon} tw-flex-shrink-0` 
            })}
          </div>
          {showText && (
            <span className="tw-flex-shrink-0">
              {loading ? 'Processing...' : text}
            </span>
          )}
        </>
      )}
    </button>
  );
});

ButtonProfessional.displayName = 'ButtonProfessional';

// Default export untuk kemudahan import
export default {
  ButtonGradient,
  ButtonPlay,
  ButtonProfessional
};

// Export action types untuk TypeScript
export type { ActionType, ButtonTemplateProps };

// Helper functions untuk digunakan di luar komponen
export { getActionColors, getActionIcon, getActionText };