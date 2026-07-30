import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(50, 'Role name must be under 50 characters'),
  key: z.string().min(2, 'Role key must be at least 2 characters').max(30, 'Role key must be under 30 characters').regex(/^[a-z0-9_]+$/, 'Key must contain lowercase letters, numbers, and underscores only'),
  description: z.string().optional(),
});

export type CreateRoleFormInput = z.infer<typeof createRoleSchema>;

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  permissionKeys: z.array(z.string()),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
