import React from 'react';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import SubcategoryItem from './SubcategoryItem';
import { useBudget } from '../../../contexts/BudgetContext';
import { LoadingSpinner } from '../../ui/LoadingState';

const CategoryItem = ({ categoryName, categoryData, isExpanded }) => {
  const { state, actions } = useBudget();
  const { loadingStates } = state;

  return (
    <div className="border border-border rounded-lg shadow-sm bg-card overflow-visible">
      {/* Category Header */}
      <div className="p-4 bg-category border-b border-border flex items-center justify-between">
        {/* Clickable area for expand/collapse */}
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-category-hover rounded-md p-2 -ml-2 transition-colors"
          onClick={() => actions.toggleCategory(categoryName)}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${categoryName} category`}
        >
          {isExpanded ?
            <ChevronDown className="w-5 h-5 text-primary" /> :
            <ChevronRight className="w-5 h-5 text-primary" />
          }
          <div>
            <h3 className="font-semibold text-lg text-category-text">{categoryName}</h3>
            <p className="text-sm text-category-muted">
              Budget: $
              {categoryData.items
                ?.reduce((sum, sub) => sum + (sub.allotted ?? 0), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Options menu */}
        <div onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Category options">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => actions.openModal('edit-category', {
                  id: categoryData.id,
                  name: categoryName
                })}
              >
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.openModal('subcategory', {
                  id: categoryData.id,
                  name: categoryName
                })}
              >
                Add Subcategory
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => actions.deleteCategory(categoryData.id)}
                className="text-destructive"
              >
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subcategories */}
      {isExpanded && (
        <div className="divide-y divide-border">
          {categoryData.items.map((item) => (
            <SubcategoryItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;