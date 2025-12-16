// components/budget/BudgetDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { BarChart2, Calendar, ChevronLeft, ChevronRight, Plus, Wallet } from 'lucide-react';
import CategoryList from './CategoryList';
import BudgetOverview from './Charts/BudgetOverview';
import { Button } from '../ui/button';
import LoadingState from '../ui/LoadingState';
import BaseModal from '../modals/BaseModal';
import { motion, AnimatePresence } from 'framer-motion';

const BudgetDashboard = () => {
  const { state, actions } = useBudget();
  const { categories, isLoading, loadingStates, modal } = state;
  const [showGraph, setShowGraph] = useState(false);
  const [dates, setDates] = useState([]);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Helper function to parse date string "December 2025" to { month: 12, year: 2025 }
  const parseDateString = (dateString) => {
    const [monthName, yearStr] = dateString.split(' ');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames.indexOf(monthName) + 1;
    const year = parseInt(yearStr, 10);
    return { month, year };
  };

  // Generate last 12 months
  useEffect(() => {
    const currentDate = new Date();
    const monthsList = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      monthsList.push(monthYear);
    }
    setDates(monthsList);
    if (!state.selectedDate) {
      actions.setSelectedDate(monthsList[0]);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) setHasInitiallyLoaded(true);
  }, [isLoading]);

  // Date navigation helpers
  const currentDateIndex = dates.indexOf(state.selectedDate || '');
  const handlePrevMonth = () => {
    if (currentDateIndex < dates.length - 1) actions.setSelectedDate(dates[currentDateIndex + 1]);
  };
  const handleNextMonth = () => {
    if (currentDateIndex > 0) actions.setSelectedDate(dates[currentDateIndex - 1]);
  };

  const handleJumpToToday = () => {
    // Assuming the first date in the list is the current month
    if (dates.length > 0) actions.setSelectedDate(dates[0]);
  };

  if (isLoading && !hasInitiallyLoaded) {
    return <LoadingState message="Loading your budget..." />;
  }

  // Calculate totals for quick stats
  const totalBudget = Object.values(categories).reduce((acc, cat) => acc + (cat.budget || 0), 0);
  const totalSpent = Object.values(categories).reduce((acc, cat) => {
    return acc + (cat.items?.reduce((subAcc, sub) => {
      return subAcc + (sub.transactions?.reduce((tAcc, t) => tAcc + t.amount, 0) || 0);
    }, 0) || 0);
  }, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">

      {/* Modern Header with Date Picker */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} disabled={currentDateIndex >= dates.length - 1} className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 h-8 w-8">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-[140px] justify-center">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-semibold text-lg">{state.selectedDate}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={currentDateIndex <= 0} className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 h-8 w-8">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            disabled={currentDateIndex === 0}
            className="hidden md:flex rounded-full text-xs h-9 bg-transparent border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            Today
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showGraph ? "default" : "outline"}
            onClick={() => setShowGraph(!showGraph)}
            className="rounded-full gap-2 transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            {showGraph ? 'Hide Stats' : 'Show Stats'}
          </Button>
          <Button
            onClick={() => actions.openModal('category')}
            className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </div>
      </header>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Budget" value={totalBudget} icon={Wallet} color="text-primary" />
        <StatCard label="Total Spent" value={totalSpent} icon={BarChart2} color="text-orange-500" />
        <StatCard label="Remaining" value={remaining} icon={TrendingUp} color="text-green-500" />
      </div>

      <AnimatePresence mode='wait'>
        {showGraph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-6">
              <BudgetOverview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Category List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CategoryList />
      </motion.div>

      {/* Modals */}
      <BaseModal
        isOpen={modal.isOpen}
        onClose={actions.closeModal}
        type={modal.type}
        initialValues={modal.data}
        onSubmit={(data) => {
          // Keep existing submit logic
          const { month, year } = parseDateString(state.selectedDate);
          switch (modal.type) {
            case 'category':
              actions.createCategory({ ...data, month, year }); break;
            case 'edit-category':
              actions.editCategory(modal.data.id, { name: data.name, month, year }); break;
            case 'subcategory':
              actions.createSubcategory({ ...data, category_id: modal.data.id }); break;
            case 'transaction':
              actions.createTransaction({ ...data, subcategory_id: modal.data.subcategory_id }); break;
            case 'edit-transaction':
              actions.updateTransaction(modal.data.id, data); break;
            case 'edit-subcategory':
              actions.updateSubcategory(modal.data.id, data); break;
          }
          actions.closeModal();
        }}
      />
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold tracking-tight">${value.toFixed(2)}</p>
    </div>
    <div className={`p-3 rounded-xl bg-background border border-border/50 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

import { TrendingUp } from 'lucide-react'; // Import missing icon locally if needed

export default BudgetDashboard;