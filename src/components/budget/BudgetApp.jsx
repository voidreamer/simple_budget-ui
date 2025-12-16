import React from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';
import BudgetDashboard from './BudgetDashboard';
import ThemeToggle from '../ui/theme-toggle';

const BudgetSwitcher = () => {
  const { budgets, currentBudget, switchBudget, createNewBudget, addMember } = useBudget();

  if (!currentBudget) return <div>Loading...</div>;

  return (
    <div className="flex items-center gap-2">
      <select
        className="p-2 rounded border bg-background text-foreground"
        value={currentBudget.id}
        onChange={(e) => switchBudget(parseInt(e.target.value))}
      >
        {budgets.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <button
        onClick={() => {
          const name = prompt("Enter new budget name:");
          if (name) createNewBudget(name);
        }}
        className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
      >
        + New
      </button>
      <button
        onClick={() => {
          const id = prompt("Enter User ID (UUID) to invite:");
          if (id) addMember(id);
        }}
        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
      >
        + Member
      </button>
    </div>
  );
};

const BudgetApp = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border p-4">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">SimpleBudget</h1>
            <BudgetSwitcher />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground">
              Logout
            </button>
          </div>
        </div>
      </header>
      <BudgetDashboard />
    </div>
  )
};

export default BudgetApp;