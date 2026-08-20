import React from 'react';
import {
  Calendar,
  Pill,
  Clock,
  History,
  Package,
  Settings,
  Check,
  RotateCcw,
  AlertTriangle,
  Plus,
  X,
  ChevronRight,
  TrendingUp,
  Activity,
  Droplet,
  HeartPulse,
  Info,
  RefreshCw,
  Search,
  Bell,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export type IconName =
  | 'today'
  | 'medications'
  | 'schedule'
  | 'history'
  | 'refills'
  | 'settings'
  | 'pill'
  | 'clock'
  | 'check'
  | 'rotate-ccw'
  | 'alert'
  | 'plus'
  | 'x'
  | 'chevron-right'
  | 'trend'
  | 'activity'
  | 'droplet'
  | 'heart'
  | 'info'
  | 'refresh'
  | 'search'
  | 'bell'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'bedtime'
  | 'check-circle'
  | 'x-circle'
  | 'help';

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  switch (name) {
    case 'today':
    case 'calendar':
      return <Calendar size={size} className={className} />;
    case 'medications':
    case 'pill':
      return <Pill size={size} className={className} />;
    case 'schedule':
    case 'clock':
      return <Clock size={size} className={className} />;
    case 'history':
      return <History size={size} className={className} />;
    case 'refills':
    case 'package':
      return <Package size={size} className={className} />;
    case 'settings':
      return <Settings size={size} className={className} />;
    case 'check':
      return <Check size={size} className={className} />;
    case 'rotate-ccw':
      return <RotateCcw size={size} className={className} />;
    case 'alert':
      return <AlertTriangle size={size} className={className} />;
    case 'plus':
      return <Plus size={size} className={className} />;
    case 'x':
      return <X size={size} className={className} />;
    case 'chevron-right':
      return <ChevronRight size={size} className={className} />;
    case 'trend':
      return <TrendingUp size={size} className={className} />;
    case 'activity':
      return <Activity size={size} className={className} />;
    case 'droplet':
      return <Droplet size={size} className={className} />;
    case 'heart':
      return <HeartPulse size={size} className={className} />;
    case 'info':
      return <Info size={size} className={className} />;
    case 'refresh':
      return <RefreshCw size={size} className={className} />;
    case 'search':
      return <Search size={size} className={className} />;
    case 'bell':
      return <Bell size={size} className={className} />;
    case 'morning':
      return <Coffee size={size} className={className} />;
    case 'afternoon':
      return <Sun size={size} className={className} />;
    case 'evening':
      return <Sunset size={size} className={className} />;
    case 'bedtime':
      return <Moon size={size} className={className} />;
    case 'check-circle':
      return <CheckCircle2 size={size} className={className} />;
    case 'x-circle':
      return <XCircle size={size} className={className} />;
    default:
      return <HelpCircle size={size} className={className} />;
  }
};
