import { useState } from 'react'

import { useUserSearch } from './custom-hooks-pattern'

export function UserSearch() {
  const [search, setSearch] = useState('')
  const { data: results, isFetching } = useUserSearch(search)

  return (
    <div>
      <label htmlFor="user-search-input" className="sr-only">
        Search users
      </label>
      <input
        id="user-search-input"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        aria-label="Search users"
      />

      {isFetching && <span>Searching...</span>}

      {results && (
        <ul>
          {results.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
