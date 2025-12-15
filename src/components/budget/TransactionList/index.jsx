// components/budget/TransactionList/index.jsx
import React from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu';
import { useBudget } from '../../../contexts/BudgetContext';
import { TRANSACTION_ICONS } from '../TransactionIconSelect';
import { LoadingSpinner } from '../../ui/LoadingState';

const TransactionList = ({ subcategory }) => {
  const { actions, state } = useBudget();
  const { loadingStates } = state;

  return (
    <div className="pl-12 pr-4 py-2 bg-muted/50 overflow-visible">
      <div className="space-y-2">
        {subcategory.transactions?.map(transaction => {
          const IconComponent = TRANSACTION_ICONS.find(i => i.label === transaction.icon)?.icon ||
            TRANSACTION_ICONS[0].icon;

          return (
            <div key={transaction.id} className="bg-card rounded-lg p-3 shadow-sm relative border border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-success">
                    ${transaction.amount.toFixed(2)}
                  </span>
                  {transaction.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Transaction options">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => actions.openModal('edit-transaction', transaction)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => actions.deleteTransaction(transaction.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(!subcategory.transactions || subcategory.transactions.length === 0) && (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
            <p>No transactions yet</p>
          </div>
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => actions.openModal('transaction', {
              subcategory_id: subcategory.id
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;