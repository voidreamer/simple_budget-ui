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

  // UI State
  const [expandedCategories, setExpandedCategories] = useState([]);

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
        // Set currentBudget directly here since we have the data
        setCurrentBudget(active);
        localStorage.setItem('active_budget_id', active.id);
      }
    } catch (error) {
      console.error("Failed to load budgets", error);
    } finally {
      setLoading(false);
    }
  };

  const switchBudget = (budgetId) => {
    // Use budgets from state OR find from the current budgets
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
      console.log('fetchDashboardData - date parts:', parts, 'year:', parts[1], 'month:', parts[0]);
      const data = await budgetApi.fetchBudgetData(parts[1], parts[0]);
      console.log('fetchDashboardData - received data:', data);
      setCategories(data || {});
      console.log('fetchDashboardData - categories state updated');
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

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const refreshData = () => fetchDashboardData();

  const createCategory = async (data) => {
    try {
      await budgetApi.createCategory(data);
      await refreshData();
    } catch (error) {
      console.error("Failed to create category:", error);
      alert(`Failed to create category: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };
  const editCategory = async (id, data) => {
    try {
      await budgetApi.editCategory(id, data);
      await refreshData();
    } catch (error) {
      console.error("Failed to edit category:", error);
      alert(`Failed to edit category: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await budgetApi.deleteCategory(id);
      await refreshData();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert(`Failed to delete category: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };
  const createSubcategory = async (data) => {
    console.log('createSubcategory called with:', data);
    try {
      const result = await budgetApi.createSubcategory(data);
      console.log('createSubcategory result:', result);
      await refreshData();
      console.log('refreshData completed');
      return result;
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      alert(`Failed to create subcategory: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };
  const updateSubcategory = async (id, data) => {
    try {
      await budgetApi.updateSubcategory(id, data);
      await refreshData();
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      alert(`Failed to update subcategory: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };
  const createTransaction = async (data) => {
    try {
      await budgetApi.createTransaction(data);
      await refreshData();
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert(`Failed to create transaction: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };
  const updateTransaction = async (id, data) => {
    try {
      await budgetApi.updateTransaction(id, data);
      await refreshData();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert(`Failed to update transaction: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const deleteSubcategory = async (id) => {
    try {
      await budgetApi.deleteSubcategory(id);
      await refreshData();
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      alert(`Failed to delete subcategory: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await budgetApi.deleteTransaction(id);
      await refreshData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert(`Failed to delete transaction: ${error.message || 'Unknown error'}`);
      throw error;
    }
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
      selectedDate,
      expandedCategories
    },
    actions: {
      setSelectedDate,
      openModal,
      closeModal,
      toggleCategory,
      createCategory,
      editCategory,
      deleteCategory,
      createSubcategory,
      updateSubcategory,
      deleteSubcategory,
      createTransaction,
      updateTransaction,
      deleteTransaction
    }
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};