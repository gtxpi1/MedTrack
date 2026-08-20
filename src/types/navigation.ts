/**
 * Application Navigation & View Types
 */

export type AppView = 
  | 'today' 
  | 'medications' 
  | 'schedule' 
  | 'history' 
  | 'refills' 
  | 'settings';

export interface NavItem {
  id: AppView;
  label: string;
  icon: string;
  badgeCount?: number;
}
