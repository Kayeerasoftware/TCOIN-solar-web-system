import { useQuery } from '@tanstack/react-query';
import { getCompanyProfile } from '@/api/endpoints/documents';
import { qk } from '@/api/queryKeys';
import { FALLBACK_PROFILE } from '@/config/companyProfile';

export function useCompanyProfile() {
  const { data } = useQuery({ queryKey: qk.company, queryFn: getCompanyProfile, staleTime: 60 * 60 * 1000, retry: 0 });
  return data ?? FALLBACK_PROFILE;
}
