import { useQuery } from '@tanstack/react-query'
import { fetchPublicAppConfig } from '@/services/appConfigService'

export function useAppConfig() {
  return useQuery({
    queryKey: ['public-app-config'],
    queryFn: fetchPublicAppConfig,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
