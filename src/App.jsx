import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import { BudgetProvider } from './contexts/BudgetContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './components/auth/LoginPage'
import BudgetApp from './components/budget/BudgetApp'
import AcceptInvite from './pages/AcceptInvite'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <LoginPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
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
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App