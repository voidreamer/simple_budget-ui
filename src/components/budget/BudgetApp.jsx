import React, { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';
import BudgetDashboard from './BudgetDashboard';
import ThemeToggle from '../ui/theme-toggle';
import ColorThemeSwitcher from '../ui/ColorThemeSwitcher';
import { ChevronDown, Plus, Users, Wallet, LogOut, Loader2 } from 'lucide-react';

// Modern Budget Selector with Dropdown
const BudgetSelector = () => {
  const { budgets, currentBudget, switchBudget, createNewBudget, addMember, loading } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (newBudgetName.trim()) {
      await createNewBudget(newBudgetName.trim());
      setNewBudgetName('');
      setShowNewBudgetForm(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (inviteUserId.trim()) {
      await addMember(inviteUserId.trim());
      setInviteUserId('');
      setShowInviteForm(false);
    }
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading budgets...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Budget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <Wallet className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">
          {currentBudget ? currentBudget.name : 'Select Budget'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowNewBudgetForm(false);
              setShowInviteForm(false);
            }}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Budget List */}
            {budgets.length > 0 && (
              <div className="p-2 border-b border-border">
                <p className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wider">Your Budgets</p>
                {budgets.map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => {
                      switchBudget(budget.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      currentBudget?.id === budget.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="flex-1 truncate">{budget.name}</span>
                    {currentBudget?.id === budget.id && (
                      <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              {/* New Budget Form */}
              {showNewBudgetForm ? (
                <form onSubmit={handleCreateBudget} className="p-2">
                  <input
                    type="text"
                    value={newBudgetName}
                    onChange={(e) => setNewBudgetName(e.target.value)}
                    placeholder="Budget name..."
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewBudgetForm(false)}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewBudgetForm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-muted text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <span>New Budget</span>
                </button>
              )}

              {/* Invite Member Form */}
              {currentBudget && (
                <>
                  {showInviteForm ? (
                    <form onSubmit={handleInvite} className="p-2 mt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Invite to "{currentBudget.name}"</p>
                      <input
                        type="text"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)}
                        placeholder="User ID (UUID)..."
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="flex-1 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                        >
                          Invite
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Welcome Screen for new users with no budgets
const WelcomeScreen = () => {
  const { createNewBudget, loading } = useBudget();
  const { user } = useAuth();
  const [budgetName, setBudgetName] = useState('');
  const [budgetType, setBudgetType] = useState('personal');

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = budgetName.trim() || (budgetType === 'personal' ? 'Personal Budget' : 'Household Budget');
    await createNewBudget(name);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to SimpleBudget!</h2>
          <p className="text-muted-foreground">
            Let's create your first budget to start tracking your finances.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Budget Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBudgetType('personal')}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                budgetType === 'personal'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Wallet className={`w-5 h-5 mb-2 ${budgetType === 'personal' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-foreground">Personal</p>
              <p className="text-xs text-muted-foreground">Just for you</p>
            </button>
            <button
              type="button"
              onClick={() => setBudgetType('household')}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                budgetType === 'household'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Users className={`w-5 h-5 mb-2 ${budgetType === 'household' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-foreground">Household</p>
              <p className="text-xs text-muted-foreground">Share with family</p>
            </button>
          </div>

          {/* Budget Name Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Budget Name (optional)
            </label>
            <input
              type="text"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder={budgetType === 'personal' ? 'Personal Budget' : 'Household Budget'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Budget
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const BudgetApp = () => {
  const { logout, user } = useAuth();
  const { budgets, currentBudget, loading } = useBudget();

  // Show welcome screen if user has no budgets
  const showWelcome = !loading && budgets.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary">SimpleBudget</h1>
              {!showWelcome && <BudgetSelector />}
            </div>
            <div className="flex items-center gap-3">
              {user?.email && (
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
              )}
              <ColorThemeSwitcher />
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {showWelcome ? (
        <WelcomeScreen />
      ) : (
        <BudgetDashboard />
      )}
    </div>
  );
};

export default BudgetApp;
