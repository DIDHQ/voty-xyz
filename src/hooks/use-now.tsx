import { useQuery } from '@tanstack/react-query'

export default function useNow() {
  const { data = new Date() } = useQuery(['now'], () => new Date())
  return data
}
