import React, { createContext, useContext, useState, useEffect } from 'react';
import { budgetApi } from '../utils/api';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  // Multi-tenancy State
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);

  // Dashboard Data State
  const [categories, setCategories] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  });
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({}); // For specific actions

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  // 1. Fetch Budgets on Login
  useEffect(() => {
    if (user) {
      refreshBudgets();
    } else {
      setBudgets([]);
      setCurrentBudget(null);
      setCategories({});
    }
  }, [user]);

  // 2. Fetch Dashboard Data when Budget or Date changes
  useEffect(() => {
    if (currentBudget && selectedDate) {
      fetchDashboardData();
    }
  }, [currentBudget, selectedDate]);

  const refreshBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetApi.getBudgets();
      setBudgets(data);

      const storedId = localStorage.getItem('active_budget_id');
      const active = data.find(b => b.id.toString() === storedId) || data[0];

      if (active) {
        switchBudget(active.id);
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
      // Data fetch triggered by useEffect
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const parts = selectedDate.split(' ');
      const data = await budgetApi.fetchBudgetData(parts[1], parts[0]);
      setCategories(data || {});
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setCategories({});
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const createNewBudget = async (name) => {
    try {
      const newBudget = await budgetApi.createBudget(name);
      await refreshBudgets();
      switchBudget(newBudget.id);
    } catch (e) { console.error(e); }
  };

  const addMember = async (userId) => {
    if (!currentBudget) return;
    try {
      await budgetApi.addBudgetMember(currentBudget.id, userId);
      alert(`Successfully added user ${userId} to budget "${currentBudget.name}"`);
    } catch (error) {
      console.error("Failed to add member:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add member";
      alert(`Error: ${errorMessage}`);
      throw error; // Re-throw so caller knows it failed
    }
  };

  // Legacy Actions (adapted)
  const openModal = (type, data = null) => setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  const refreshData = () => fetchDashboardData();

  const createCategory = async (data) => {
    await budgetApi.createCategory({ ...data, budget: 0 }); // budget amount, not ID
    refreshData();
  };
  const editCategory = async (id, data) => {
    await budgetApi.editCategory(id, data);
    refreshData();
  };
  const createSubcategory = async (data) => {
    await budgetApi.createSubcategory(data);
    refreshData();
  };
  const updateSubcategory = async (id, data) => {
    await budgetApi.updateSubcategory(id, data);
    refreshData();
  };
  const createTransaction = async (data) => {
    await budgetApi.createTransaction(data);
    refreshData();
  };
  const updateTransaction = async (id, data) => {
    await budgetApi.updateTransaction(id, data);
    refreshData();
  };

  // Construct the "state" and "actions" objects expected by BudgetDashboard
  const value = {
    // New Structure
    budgets,
    currentBudget,
    switchBudget,
    createNewBudget,
    addMember,
    loading,

    // Adapter for BudgetDashboard
    state: {
      categories,
      isLoading: loading,
      loadingStates,
      modal,
      selectedDate
    },
    actions: {
      setSelectedDate,
      openModal,
      closeModal,
      createCategory,
      editCategory,
      createSubcategory,
      updateSubcategory,
      createTransaction,
      updateTransaction
    }
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};