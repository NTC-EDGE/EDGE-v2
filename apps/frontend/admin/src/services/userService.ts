import { useApi } from './api';
import { User } from '@edge/api';

export function useUserService() {
  const { useQuery, put, del } = useApi();

  const useUsers = () => {
    return useQuery<User[]>('/users');
  };

  const useUser = (id: string | null) => {
    return useQuery<User>(id !== null && id.length > 0 ? `/users/${id}` : null);
  };

  const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
    return put<User, Partial<User>>(`/users/${id}`, data);
  };

  const deleteUser = async (id: string): Promise<void> => {
    return del<void>(`/users/${id}`);
  };

  return {
    useUsers,
    useUser,
    updateUser,
    deleteUser,
  };
}
