// src/main.tsx - Complete DevTools Setup
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'

import { queryClient } from './devtools-setup-shared'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      {/*
        ReactQueryDevtools Configuration

        IMPORTANT: DevTools are automatically tree-shaken in production
        Safe to leave in code, won't appear in production bundle
      */}
      <ReactQueryDevtools
        // Start collapsed (default: false)
        initialIsOpen={false}

        // Button position on screen
        buttonPosition="bottom-right" // "top-left" | "top-right" | "bottom-left" | "bottom-right"

        // Panel position when open
        position="bottom" // "top" | "bottom" | "left" | "right"

        // Custom styles for toggle button
        toggleButtonProps={{
          style: {
            marginBottom: '4rem', // Move up if button overlaps content
            marginRight: '1rem',
          },
        }}

        // Custom styles for panel
        panelProps={{
          style: {
            height: '400px', // Custom panel height
          },
        }}

        // Add keyboard shortcut (optional)
        // Default: None, but you can add custom handler
      />
    </QueryClientProvider>
  </StrictMode>
)

/**
 * Advanced: Conditional DevTools (explicit dev check)
 *
 * DevTools are already removed in production, but can add explicit check
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </StrictMode>
)

/**
 * Advanced: Custom Toggle Button — see devtools-setup-app-with-custom-devtools.tsx
 */

/**
 * DevTools Features (what you can do):
 *
 * 1. View all queries: See queryKey, status, data, error
 * 2. Inspect cache: View cached data for each query
 * 3. Manual refetch: Force refetch any query
 * 4. View mutations: See in-flight and completed mutations
 * 5. Query invalidation: Manually invalidate queries
 * 6. Explorer mode: Navigate query hierarchy
 * 7. Time travel: See query state over time
 * 8. Export state: Download current cache for debugging
 *
 * DevTools Panel Sections:
 * - Queries: All active/cached queries
 * - Mutations: Recent mutations
 * - Query Cache: Full cache state
 * - Mutation Cache: Mutation history
 * - Settings: DevTools configuration
 */

/**
 * Debugging with DevTools
 */

// Example: Check if query is being cached correctly — see devtools-setup-debug-query-caching.tsx

// Example: Debug why query keeps refetching — see devtools-setup-debug-refetching-issue.tsx

/**
 * Production DevTools (optional, separate package)
 *
 * For debugging production issues remotely
 * npm install @tanstack/react-query-devtools-production
 */
// See devtools-setup-app-with-production-devtools.tsx

/**
 * Keyboard Shortcuts (DIY)
 *
 * Add custom keyboard shortcut to toggle DevTools
 */
// See devtools-setup-app-with-keyboard-shortcut.tsx

/**
 * Best Practices:
 *
 * ✅ Keep DevTools in code (tree-shaken in production)
 * ✅ Start with initialIsOpen={false} to avoid distraction
 * ✅ Use DevTools to debug cache issues
 * ✅ Check DevTools when queries refetch unexpectedly
 * ✅ Export state for bug reports
 *
 * ❌ Don't ship production devtools without authentication
 * ❌ Don't rely on DevTools for production monitoring
 * ❌ Don't expose sensitive data in cache (use select to filter)
 *
 * Performance:
 * - DevTools have minimal performance impact in dev
 * - Completely removed in production builds
 * - No runtime overhead when not open
 */
