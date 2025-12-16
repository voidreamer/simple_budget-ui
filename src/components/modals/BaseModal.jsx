import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import CategoryForm from './forms/CategoryForm';
import TransactionForm from './forms/TransactionForm';
 

const MODAL_CONFIGS = {
  category: {
    title: 'Add Category',
    component: CategoryForm
  },
  subcategory: {
    title: 'Add Subcategory',
    component: CategoryForm
  },
  transaction: {
    title: 'Add Transaction',
    component: TransactionForm
  },
  'edit-transaction': {
    title: 'Edit Transaction',
    component: TransactionForm
  },
  'edit-category': {
    title: 'Edit Category',
    component: CategoryForm
  },
  'edit-subcategory': {
    title: 'Edit Subcategory',
    component: CategoryForm
  }
};

const BaseModal = ({ 
  isOpen, 
  onClose, 
  type, 
  onSubmit, 
  initialValues = {},
  extraProps = {} 
}) => {
  const config = MODAL_CONFIGS[type];
  if (!config) return null;

  const FormComponent = config.component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <FormComponent
          onSubmit={async (data) => {
            await onSubmit(data);
            // Don't close here - let the parent handle closing after async operations
          }}
          initialValues={initialValues}
          type={type}
          {...extraProps}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BaseModal;