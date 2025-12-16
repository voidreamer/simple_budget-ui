import React from 'react';
import { useForm } from '../../../hooks/useForm';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

const CategoryForm = ({ onSubmit, initialValues = {}, type = 'category' }) => {
  const { values, handleChange, reset } = useForm({
    name: '',
    amount: '',
    ...initialValues
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCategory = type === 'category' || type === 'edit-category';
    onSubmit(
      isCategory
        ? {
            name: values.name,
            budget: parseFloat(values.amount) || 0
          }
        : {
            name: values.name,
            allotted: parseFloat(values.amount) || 0
          }
    );
    reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          name="name"
          placeholder="Name"
          value={values.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder={(type === 'category' || type === 'edit-category') ? 'Budget Amount' : 'Allotted Amount'}
          value={values.amount}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default CategoryForm;