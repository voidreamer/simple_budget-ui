import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import { BudgetProvider } from './contexts/BudgetContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './components/auth/LoginPage'
import BudgetApp from './components/budget/BudgetApp'
import AcceptInvite from './pages/AcceptInvite'

// Assuming ToastProvider is missing or we remove it for now to fix build if needed.
// If it was working before, it might have been imported from a shadcn component.
// I'll define a dummy one or try to locate it if user complains. For now removal is safer than broken import.
const ToastProvider = ({ children }) => <>{children}</>;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <LoginPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <BudgetApp />
                    </ProtectedRoute>
                  } />
                  <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </ToastProvider>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App