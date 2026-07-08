// Placeholder components for error-boundary skill examples (documentation only)
import type { ReactNode } from 'react'
import Link from 'next/link'

import { ErrorBoundary } from './error-boundary'

function App() {
  return <div>App</div>
}

function UserProfile() {
  return <div>UserProfile</div>
}

function AppCrashScreen({ error }: { error: Error }) {
  return <div>App crash: {error.message}</div>
}

function Header() {
  return <header>Header</header>
}

function FeatureError({ error }: { error: Error }) {
  return <div>Feature error: {error.message}</div>
}

function TodoList() {
  return <ul>TodoList</ul>
}

function Footer() {
  return <footer>Footer</footer>
}

export function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export function UserProfileWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <UserProfile />
    </ErrorBoundary>
  )
}

export function CustomErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="error-container">
          <h1>Oops!</h1>
          <p>We encountered an error: {error.message}</p>
          <button type="button" onClick={reset}>
            Retry
          </button>
          <Link href="/">Go Home</Link>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function LayeredErrorBoundaries() {
  return (
    <ErrorBoundary fallback={(error) => <AppCrashScreen error={error} />}>
      <Header />

      <ErrorBoundary fallback={(error) => <FeatureError error={error} />}>
        <UserProfile />
      </ErrorBoundary>

      <ErrorBoundary>
        <TodoList />
      </ErrorBoundary>

      <Footer />
    </ErrorBoundary>
  )
}
