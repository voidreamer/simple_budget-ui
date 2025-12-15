import BudgetApp from './components/budget/BudgetApp'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <BudgetApp />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App