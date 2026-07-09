import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools as ReactQueryDevtoolsProd } from '@tanstack/react-query-devtools-production'

import App from './App'

import { queryClient } from './devtools-setup-shared'

export function AppWithProductionDevTools() {
  const [showDevTools, setShowDevTools] = useState(false)

  const handleToggleDevTools = () => {
    const next = !showDevTools
    if (next) {
      void import('@tanstack/react-query-devtools-production')
    }
    setShowDevTools(next)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <button type="button" onClick={handleToggleDevTools}>
        {showDevTools ? 'Hide' : 'Show'} production DevTools
      </button>
      {showDevTools && <ReactQueryDevtoolsProd />}
    </QueryClientProvider>
  )
}
