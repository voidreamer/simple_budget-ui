// components/budget/CategoryList/SubcategoryItem.jsx
import React, { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import TransactionList from '../TransactionList';
import { useBudget } from '../../../contexts/BudgetContext';
import { motion, AnimatePresence } from 'framer-motion';

const SubcategoryItem = ({ item }) => {
  const [showTransactions, setShowTransactions] = useState(false);
  const { actions } = useBudget();

  // Stats
  const allotted = item.allotted ?? 0;
  const spent = item.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const percentage = allotted > 0 ? (spent / allotted) * 100 : 0;
  const isOverBudget = spent > allotted;
  const remaining = allotted - spent;

  return (
    <div className="group relative">
      <div
        className={`
            pl-4 pr-4 py-3 border-l-4 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5
            ${isOverBudget ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-l-transparent hover:border-l-primary/30'}
        `}
        onClick={() => setShowTransactions(!showTransactions)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-1 rounded-md transition-colors ${showTransactions ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
              {showTransactions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground">{item.name}</h4>
                {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className="text-muted-foreground font-medium w-16 text-right">${spent.toFixed(0)} of ${allotted.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className={`text-sm font-semibold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                ${remaining.toFixed(2)}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>

            <div onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuItem
                    onClick={() => actions.openModal('edit-subcategory', {
                      id: item.id,
                      allotted: item.allotted,
                      spending: spent, // Pass calculated spent 
                      name: item.name
                    })}
                    className="cursor-pointer"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => actions.deleteSubcategory(item.id)}
                    className="text-destructive cursor-pointer"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTransactions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <TransactionList subcategory={item} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubcategoryItem;