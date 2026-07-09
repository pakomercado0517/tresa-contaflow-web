import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './App'

import { queryClient } from './devtools-setup-shared'

export function AppWithCustomDevTools() {
  const [showDevTools, setShowDevTools] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <App />

      <button
        type="button"
        onClick={() => setShowDevTools(!showDevTools)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 99999,
        }}
      >
        {showDevTools ? 'Hide' : 'Show'} DevTools
      </button>

      {showDevTools && <ReactQueryDevtools initialIsOpen={true} />}
    </QueryClientProvider>
  )
}
