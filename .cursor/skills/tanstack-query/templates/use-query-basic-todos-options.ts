import { queryOptions } from '@tanstack/react-query'

export interface Todo {
  id: number
  title: string
  completed: boolean
  userId: number
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos')

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.statusText}`)
  }

  return response.json()
}

export const todosQueryOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 1000 * 60,
})
