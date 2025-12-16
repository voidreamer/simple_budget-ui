// components/budget/TransactionList/index.jsx
import React from 'react';
import { MoreVertical, Plus, DollarSign } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import { useBudget } from '../../../contexts/BudgetContext';
import { TRANSACTION_ICONS } from '../TransactionIconSelect';
import { LoadingSpinner } from '../../ui/LoadingState';

const TransactionList = ({ subcategory }) => {
  const { actions } = useBudget();

  return (
    <div className="pl-4 pr-4 pb-4 pt-1 bg-muted/30 border-t border-border/50">
      <div className="space-y-2 mt-2">
        {subcategory.transactions?.map(transaction => {
          const IconComponent = TRANSACTION_ICONS.find(i => i.label === transaction.icon)?.icon || DollarSign;

          return (
            <div key={transaction.id} className="group flex items-center justify-between p-3 rounded-xl bg-background border border-border/40 hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-full text-primary/80">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{transaction.description || 'Untitled Transaction'}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-foreground">
                  -${transaction.amount.toFixed(2)}
                </span>

                {transaction.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass">
                      <DropdownMenuItem onClick={() => actions.openModal('edit-transaction', transaction)} className="cursor-pointer">
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => actions.deleteTransaction(transaction.id)} className="text-destructive cursor-pointer">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}

        {(!subcategory.transactions || subcategory.transactions.length === 0) && (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl bg-background/30">
            No transactions yet
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors h-9"
          onClick={() => actions.openModal('transaction', { subcategory_id: subcategory.id })}
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default TransactionList;