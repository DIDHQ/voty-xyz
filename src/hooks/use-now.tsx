import { useQuery } from '@tanstack/react-query'

export default function useNow() {
  const { data = new Date() } = useQuery(['now'], () => new Date(), {
    refetchInterval: 10 * 1000,
  })
  return data
}
