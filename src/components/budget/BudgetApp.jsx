import React, { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';
import BudgetDashboard from './BudgetDashboard';
import ThemeToggle from '../ui/theme-toggle';
import ColorThemeSwitcher from '../ui/ColorThemeSwitcher';
import { ChevronDown, Plus, Users, User, Wallet, LogOut, Loader2, Check, Copy, Edit2, Trash2, X } from 'lucide-react';

// Modern Budget Selector with Dropdown
const BudgetSelector = () => {
  const { budgets, currentBudget, switchBudget, createNewBudget, renameBudget, deleteBudget, addMember, loading } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteResult, setShowInviteResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renamingBudgetId, setRenamingBudgetId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

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
    if (inviteEmail.trim()) {
      try {
        const result = await addMember(inviteEmail.trim());
        // Generate the invitation link
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        const link = `${appUrl}/accept-invite/${result.token}`;
        setInviteLink(link);
        setShowInviteResult(true);
      } catch (error) {
        console.error('Failed to create invitation:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const handleCloseInviteResult = () => {
    setShowInviteResult(false);
    setInviteEmail('');
    setInviteLink('');
    setShowInviteForm(false);
  };

  const handleStartRename = (budget) => {
    setRenamingBudgetId(budget.id);
    setRenameName(budget.name);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (renameName.trim() && renamingBudgetId) {
      try {
        await renameBudget(renamingBudgetId, renameName.trim());
        setRenamingBudgetId(null);
        setRenameName('');
      } catch (error) {
        console.error('Failed to rename budget:', error);
      }
    }
  };

  const handleCancelRename = () => {
    setRenamingBudgetId(null);
    setRenameName('');
  };

  const handleStartDelete = (budgetId) => {
    setDeletingBudgetId(budgetId);
  };

  const handleConfirmDelete = async () => {
    if (deletingBudgetId) {
      try {
        await deleteBudget(deletingBudgetId);
        setDeletingBudgetId(null);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingBudgetId(null);
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
        {currentBudget && (
          <div className="flex items-center gap-1 text-muted-foreground">
            {currentBudget.member_count === 1 ? (
              <User className="w-3.5 h-3.5" />
            ) : (
              <>
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">{currentBudget.member_count}</span>
              </>
            )}
          </div>
        )}
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
                  <div key={budget.id} className="group relative">
                    {renamingBudgetId === budget.id ? (
                      <form onSubmit={handleRename} className="p-2">
                        <input
                          type="text"
                          value={renameName}
                          onChange={(e) => setRenameName(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="submit"
                            className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            switchBudget(budget.id);
                            setIsOpen(false);
                          }}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                            currentBudget?.id === budget.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <Wallet className="w-4 h-4" />
                          <span className="flex-1 truncate">{budget.name}</span>

                          {/* Shared/Personal Indicator */}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {budget.member_count === 1 ? (
                              <User className="w-3.5 h-3.5" title="Personal budget" />
                            ) : (
                              <>
                                <Users className="w-3.5 h-3.5" title="Shared budget" />
                                <span className="text-xs">{budget.member_count}</span>
                              </>
                            )}
                          </div>

                          {currentBudget?.id === budget.id && (
                            <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </button>
                        <div className="flex gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(budget);
                            }}
                            className="p-1 hover:bg-muted rounded"
                            title="Rename budget"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDelete(budget.id);
                            }}
                            className="p-1 hover:bg-muted rounded"
                            title="Delete budget"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                    showInviteResult ? (
                      <div className="p-3 mt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Invitation created for {inviteEmail}</p>
                        <div className="bg-muted/50 rounded-md p-2 mb-2">
                          <p className="text-xs font-mono break-all text-foreground">{inviteLink}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCloseInviteResult}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleInvite} className="p-2 mt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Invite to "{currentBudget.name}"</p>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                          required
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
                    )
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

      {/* Delete Confirmation Modal */}
      {deletingBudgetId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleCancelDelete} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-xl z-50 p-6 max-w-sm w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Budget?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Are you sure you want to delete "{budgets.find(b => b.id === deletingBudgetId)?.name}"?
                  This will permanently delete all categories, subcategories, and transactions. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
