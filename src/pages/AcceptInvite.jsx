import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { budgetApi } from '../utils/api';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState('validating'); // validating, valid, invalid, accepting, accepted, error
  const [inviteDetails, setInviteDetails] = useState(null);
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  useEffect(() => {
    // If user logs in while on this page, auto-accept
    if (user && status === 'valid') {
      acceptInvitation();
    }
  }, [user, status]);

  const validateInvitation = async () => {
    try {
      const data = await budgetApi.validateInvitation(token);
      setInviteDetails(data);
      setStatus('valid');

      // If already logged in, accept immediately
      if (user) {
        acceptInvitation();
      }
    } catch (err) {
      setStatus('invalid');
      setError(err.message || 'Invalid invitation');
    }
  };

  const acceptInvitation = async () => {
    setStatus('accepting');

    try {
      await budgetApi.acceptInvitation(token);
      setStatus('accepted');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to accept invitation');
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      // Pass the current path so OAuth redirects back here after login
      await loginWithGoogle(location.pathname);
    } catch (err) {
      setLoggingIn(false);
      setError('Failed to start login');
    }
  };

  if (status === 'validating') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg text-foreground">Validating invitation...</span>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center border border-border">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Invalid Invitation</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center border border-border">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Welcome to {inviteDetails?.budget_name}!
          </h1>
          <p className="text-muted-foreground">Redirecting to your budgets...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center border border-border">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Status is 'valid' - show login prompt
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Budget Invitation</h1>
        <div className="mb-6">
          <p className="text-muted-foreground mb-2">
            You've been invited to join <strong className="text-foreground">{inviteDetails?.budget_name}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Invitation for: <strong>{inviteDetails?.invitee_email}</strong>
          </p>
        </div>

        {!user ? (
          <div>
            <p className="mb-4 text-foreground">Please log in to accept this invitation.</p>
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to login...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Accepting invitation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
