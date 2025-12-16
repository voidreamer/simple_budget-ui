import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { budgetApi } from '../utils/api';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('validating'); // validating, valid, invalid, accepting, accepted, error
  const [inviteDetails, setInviteDetails] = useState(null);
  const [error, setError] = useState('');

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
              onClick={() => navigate('/')}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              Go to Login
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
