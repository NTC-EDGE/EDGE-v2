/// <reference path="./react-native.d.ts" />
/// <reference path="./tanstack-table.d.ts" />

// Theme Infrastructure
export * from './theme/types';
export * from './theme/tokens';
export * from './theme/themeStorage';
export { ThemeProvider, ThemeContext, type ThemeProviderProps } from './theme/ThemeProvider';
export { useTheme } from './theme/useTheme';
export * from './utils/webStyles';

// Existing Shared UI Components
export * from './components/Avatar';
export * from './components/Button';
export * from './components/FormFieldInput';
export * from './components/DatePickerField';
export * from './components/DatePickerInput';
export * from './components/AlertToast';
export * from './tables/DataTable';
export * from './tables/StatusBadge';
export * from './client/ServiceFormModal';

// New Shared UI Components (Milestone 1)
export * from './components/SkeletonLoader';
export * from './components/AnimatedCard';
export * from './components/ThemeToggle';
export * from './components/PageHeader';
export * from './components/EmptyState';
export * from './components/SearchBar';
export * from './components/ConfirmationModal';

// Navigation & Integrations
export { Feather as Icon } from '@expo/vector-icons';
export * from '@clerk/expo';
export * from '@react-navigation/native';
export * from '@react-navigation/native-stack';
export * from '@react-navigation/bottom-tabs';
export * from '@react-navigation/drawer';
export * from './navigation/linking';
