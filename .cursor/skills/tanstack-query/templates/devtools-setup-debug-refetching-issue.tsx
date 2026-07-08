import { useQuery } from '@tanstack/react-query'

async function fetchUsers() {
  return []
}

export function DebugRefetchingIssue() {
  const { isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  return <div>Fetching: {isFetching ? 'Yes' : 'No'}</div>
}
