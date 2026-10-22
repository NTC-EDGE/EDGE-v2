import { useState } from 'react';
import { useRole, UserRole } from '../context/RoleContext';
import { useAuthContext } from '../../auth/context/AuthContext';

export function useShellState() {
  const { currentRole, setCurrentRole } = useRole();
  const { user, logout } = useAuthContext();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleRoleDropdown = () => {
    setShowRoleDropdown((prev) => !prev);
  };

  const closeRoleDropdown = () => {
    setShowRoleDropdown(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleDropdown(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const promptSignOut = () => {
    setIsSignOutConfirmVisible(true);
  };

  const closeSignOutModal = () => {
    if (!isSigningOut) {
      setIsSignOutConfirmVisible(false);
    }
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
      setIsSignOutConfirmVisible(false);
    }
  };

  return {
    currentRole,
    user,
    logout,
    showRoleDropdown,
    toggleRoleDropdown,
    closeRoleDropdown,
    handleRoleSelect,
    isSwitcherHovered,
    setIsSwitcherHovered,
    isLogoutHovered,
    setIsLogoutHovered,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    isSignOutConfirmVisible,
    setIsSignOutConfirmVisible,
    isSigningOut,
    promptSignOut,
    closeSignOutModal,
    confirmSignOut,
  };
}

