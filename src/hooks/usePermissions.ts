import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  return { can: hasPermission };
}
