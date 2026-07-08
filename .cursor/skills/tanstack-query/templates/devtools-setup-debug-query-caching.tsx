import { useQuery } from '@tanstack/react-query'

async function fetchTodos() {
  return []
}

export function DebugQueryCaching() {
  const { dataUpdatedAt, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return (
    <div>
      <p>Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</p>
      <p>Is fetching: {isFetching ? 'Yes' : 'No'}</p>
    </div>
  )
}
