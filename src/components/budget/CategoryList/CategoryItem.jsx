import React from 'react';
import { ChevronDown, ChevronRight, MoreVertical, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import SubcategoryItem from './SubcategoryItem';
import { useBudget } from '../../../contexts/BudgetContext';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryItem = ({ categoryName, categoryData, isExpanded }) => {
  const { actions } = useBudget();

  // Calculate stats
  const totalAllotted = categoryData.items?.reduce((sum, sub) => sum + (sub.allotted ?? 0), 0) || 0;
  const totalSpent = categoryData.items?.reduce((sum, sub) =>
    sum + (sub.transactions?.reduce((tSum, t) => tSum + t.amount, 0) || 0), 0) || 0;

  const percentage = totalAllotted > 0 ? (totalSpent / totalAllotted) * 100 : 0;
  const isOverBudget = totalSpent > totalAllotted;
  const remaining = totalAllotted - totalSpent;

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-4 border border-border/50 shadow-sm transition-all hover:shadow-md">
      {/* Category Header */}
      <div
        className="p-5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={() => actions.toggleCategory(categoryName)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-full ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl tracking-tight uppercase">{categoryName}</h3>
                {isOverBudget && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>

              {/* Progress Bar Container */}
              <div className="mt-2 w-full max-w-md">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>${totalSpent.toFixed(2)} spent</span>
                  <span>${remaining.toFixed(2)} left</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-lg">${totalAllotted.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Budgeted</p>
            </div>

            <div onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-background rounded-full">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 glass">
                  <DropdownMenuItem onClick={() => actions.openModal('edit-category', { id: categoryData.id, name: categoryName })} className="rounded-lg cursor-pointer">
                    Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.openModal('subcategory', { id: categoryData.id, name: categoryName })} className="rounded-lg cursor-pointer">
                    Add Subcategory
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.deleteCategory(categoryData.id)} className="text-destructive rounded-lg cursor-pointer">
                    Delete Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories with AnimatePresence */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-border/50 bg-muted/30 p-4 space-y-3">
              {categoryData.items.map((item) => (
                <SubcategoryItem key={item.id} item={item} />
              ))}
              {categoryData.items.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground italic">
                  No subcategories yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryItem;