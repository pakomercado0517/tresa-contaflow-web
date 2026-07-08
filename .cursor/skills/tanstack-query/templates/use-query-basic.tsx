// src/hooks/useTodos.ts
import { useQuery } from '@tanstack/react-query'

import { todosQueryOptions, type Todo } from './use-query-basic-todos-options'

export type { Todo }

/**
 * Custom hook - encapsulates query logic
 *
 * Usage in component:
 * const { data, isPending, isError, error } = useTodos()
 */
export function useTodos() {
  return useQuery(todosQueryOptions)
}

/**
 * Fetch single todo by ID
 */
async function fetchTodoById(id: number): Promise<Todo> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch todo ${id}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Custom hook for fetching single todo
 *
 * Usage:
 * const { data: todo } = useTodo(1)
 */
export function useTodo(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
    enabled: !!id,
  })
}

/**
 * Component usage example:
 */
export function TodoList() {
  const { data, isPending, isError, error, isFetching } = useTodos()

  if (isPending) {
    return <div>Loading todos...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Todos {isFetching && '(Refetching...)'}</h1>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
              aria-label={`Todo completado: ${todo.title}`}
            />
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Key states explained:
 *
 * - isPending: No data yet (initial fetch)
 * - isLoading: isPending && isFetching (loading for first time)
 * - isFetching: Any background fetch in progress
 * - isError: Query failed
 * - isSuccess: Query succeeded and data is available
 * - data: The fetched data (undefined while isPending)
 * - error: Error object if query failed
 */
