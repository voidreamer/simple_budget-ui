import React from 'react';
import { useBudget } from '../../../contexts/BudgetContext';
import CategoryItem from './CategoryItem';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CategoryList = () => {
  const { state, actions } = useBudget();
  const { categories, expandedCategories } = state;

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([categoryName, categoryData], index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          key={categoryName}
        >
          <CategoryItem
            categoryName={categoryName}
            categoryData={categoryData}
            isExpanded={expandedCategories.includes(categoryName)}
          />
        </motion.div>
      ))}

      {Object.keys(categories).length === 0 && (
        <div
          className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 transition-all cursor-pointer group"
          onClick={() => actions.openModal('category')}
        >
          <div className="p-4 rounded-full bg-primary/10 group-hover:scale-110 transition-transform mb-4">
            <PlusCircle className="w-10 h-10 text-primary" />
          </div>
          <p className="font-semibold text-lg text-foreground">Start Budgeting</p>
          <p className="text-muted-foreground">Create your first category to get started</p>
        </div>
      )}
    </div>
  );
};

export default CategoryList;