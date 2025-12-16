import React, { createContext, useContext, useState, useEffect } from 'react';
import { budgetApi } from '../utils/api';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch budgets when user logs in
  useEffect(() => {
    if (user) {
      refreshBudgets();
    } else {
      setBudgets([]);
      setCurrentBudget(null);
    }
  }, [user]);

  const refreshBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetApi.getBudgets();
      setBudgets(data);

      // Restore active budget from localStorage or default to first
      const storedId = localStorage.getItem('active_budget_id');
      const active = data.find(b => b.id.toString() === storedId) || data[0];

      if (active) {
        switchBudget(active.id);
      } else if (data.length === 0) {
        // If no budgets exist, we might need to prompt creation or create a default "Personal" one
        // For now, let's assume the user has 0 budgets and the UI will handle it
        setCurrentBudget(null);
      }
    } catch (error) {
      console.error("Failed to load budgets", error);
    } finally {
      setLoading(false);
    }
  };

  const switchBudget = (budgetId) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setCurrentBudget(budget);
      localStorage.setItem('active_budget_id', budget.id);
      // Force refresh of data? The components listening to currentBudget should react
    }
  };

  const createNewBudget = async (name) => {
    try {
      const newBudget = await budgetApi.createBudget(name);
      await refreshBudgets();
      switchBudget(newBudget.id);
      return newBudget;
    } catch (e) {
      throw e;
    }
  };

  const addMember = async (userId) => {
    if (!currentBudget) return;
    await budgetApi.addBudgetMember(currentBudget.id, userId);
  };

  const value = {
    budgets,
    currentBudget,
    switchBudget,
    refreshBudgets,
    createNewBudget,
    addMember,
    loading
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};