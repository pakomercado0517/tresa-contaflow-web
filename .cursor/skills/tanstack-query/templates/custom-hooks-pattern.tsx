// src/hooks/useUsers.ts - Example of advanced custom hooks pattern
import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'

/**
 * Type definitions
 */
export type User = {
  id: number
  name: string
  email: string
  phone: string
}

export type CreateUserInput = Omit<User, 'id'>
export type UpdateUserInput = Partial<User> & { id: number }

/**
 * API functions - centralized network logic
 */
const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  getById: async (id: number): Promise<User> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    if (!response.ok) throw new Error(`Failed to fetch user ${id}`)
    return response.json()
  },

  create: async (user: CreateUserInput): Promise<User> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  },

  update: async ({ id, ...updates }: UpdateUserInput): Promise<User> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update user')
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete user')
  },
}

/**
 * Query options factories (v5 best practice)
 *
 * Benefits:
 * - Type-safe reusable query configurations
 * - DRY principle - single source of truth
 * - Works with useQuery, useSuspenseQuery, prefetchQuery
 * - Easier testing and mocking
 */
export const usersQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: userApi.getAll,
  staleTime: 1000 * 60 * 5, // 5 minutes
})

export const userQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id),
    staleTime: 1000 * 60 * 5,
  })

/**
 * Query Hooks
 */
export function useUsers() {
  return useQuery(usersQueryOptions)
}

export function useUser(id: number) {
  return useQuery(userQueryOptions(id))
}

/**
 * Advanced: Search/Filter Hook
 *
 * Demonstrates dependent query with filtering
 */
export function useUserSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      const users = await userApi.getAll()
      return users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    },
    enabled: searchTerm.length >= 2, // Only search if 2+ characters
    staleTime: 1000 * 30, // 30 seconds for search results
  })
}

/**
 * Mutation Hooks
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: (newUser) => {
      // Update cache with new user
      queryClient.setQueryData<User[]>(['users'], (old = []) => [...old, newUser])

      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.update,
    onSuccess: (updatedUser) => {
      // Update individual user cache
      queryClient.setQueryData(['users', updatedUser.id], updatedUser)

      // Update user in list
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      )
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.filter((user) => user.id !== deletedId)
      )

      // Remove individual query
      queryClient.removeQueries({ queryKey: ['users', deletedId] })
    },
  })
}

/**
 * Advanced: Prefetch Hook
 *
 * Prefetch user details on hover for instant navigation
 */
export function usePrefetchUser() {
  const queryClient = useQueryClient()

  return (id: number) => {
    queryClient.prefetchQuery(userQueryOptions(id))
  }
}

/**
 * Component Usage Examples
 */

// Example 1: List all users
export function UserList() {
  const { data: users, isPending, isError, error } = useUsers()
  const prefetchUser = usePrefetchUser()

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <ul>
      {users.map((user) => (
        <li
          key={user.id}
          onMouseEnter={() => prefetchUser(user.id)} // Prefetch on hover
        >
          <a href={`/users/${user.id}`}>{user.name}</a>
        </li>
      ))}
    </ul>
  )
}

export { UserDetail } from './custom-hooks-pattern-user-detail'
export { UserSearch } from './custom-hooks-pattern-user-search'

/**
 * Key patterns demonstrated:
 *
 * 1. API Layer: Centralized fetch functions
 * 2. Query Options Factories: Reusable queryOptions
 * 3. Custom Hooks: Encapsulate query logic
 * 4. Mutation Hooks: Encapsulate mutation logic
 * 5. Cache Updates: setQueryData, invalidateQueries, removeQueries
 * 6. Prefetching: Improve perceived performance
 * 7. Conditional Queries: enabled option
 * 8. Search/Filter: Derived queries from base data
 *
 * Benefits:
 * ✅ Type safety throughout
 * ✅ Easy to test (mock API layer)
 * ✅ Reusable across components
 * ✅ Consistent error handling
 * ✅ Optimized caching strategy
 * ✅ Better code organization
 */
