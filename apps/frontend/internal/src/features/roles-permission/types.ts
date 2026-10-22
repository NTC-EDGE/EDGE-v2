export interface Role {
  id: string;
  name: string;
  tenantId?: string | null;
  isSystemRole?: boolean;
  description?: string | null;
  avatarBgColor?: string;
  avatarInitials: string;
}
