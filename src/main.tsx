import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlatformProvider } from './context/PlatformContext'

render(
  <ErrorBoundary>
    <PlatformProvider>
      <App />
    </PlatformProvider>
  </ErrorBoundary>, 
  document.getElementById('app')!
)
