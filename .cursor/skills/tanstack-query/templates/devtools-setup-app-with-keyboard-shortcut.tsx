import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './App'

import { queryClient } from './devtools-setup-shared'

export function AppWithKeyboardShortcut() {
  const [showDevTools, setShowDevTools] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault()
        setShowDevTools((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <App />
      {showDevTools && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
