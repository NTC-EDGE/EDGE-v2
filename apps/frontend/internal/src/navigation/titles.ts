/**
 * Mapping of Screen Route Names to Human-Readable Titles.
 * Reused across Header Titles, Navigation Sidebars, and Web Document Tab Titles.
 */
export const SCREEN_TITLES: Record<string, string> = {
  Dashboard: "Dashboard",
  Activities: "Activities",
  Chat: "Chat",
  Meet: "Meet",
  Reports: "Reports",
  ReceiptManagement: "Receipt Management",
  RolesPermission: "Roles & Permission",
  Schedule: "Schedule",
  Employees: "Employees",
  Users: "Users",
  Settings: "Settings",
  Profile: "User Profile",
  QueueManagement: "Queue Management",
};

/**
 * Returns the exact human-readable screen title for a given route name.
 */
export function getScreenTitle(routeName: string): string {
  if (SCREEN_TITLES[routeName] !== undefined) {
    return SCREEN_TITLES[routeName];
  }

  // Fallback to formatted title if route is not in dictionary
  return routeName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str: string) => str.toUpperCase())
    .trim();
}
