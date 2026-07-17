import { useState } from 'react';
import { useRole, UserRole } from '../context/RoleContext';
import { useAuthContext } from '../../auth/context/AuthContext';

export function useShellState() {
  const { currentRole, setCurrentRole } = useRole();
  const { user, logout } = useAuthContext();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

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
  };
}
