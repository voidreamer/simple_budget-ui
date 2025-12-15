//const API_BASE_URL = 'https://simplebudget-app.onrender.com/api';
//const API_BASE_URL = 'https://simple-budget-app-bay.vercel.app/api'
//const API_BASE_URL = 'http://localhost:8001/api';

const API_BASE_URL = 'https://e3u8n54z1m.execute-api.ca-central-1.amazonaws.com/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.detail || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
};


export const budgetApi = {
  async fetchBudgetData(year, month) {
    try {
      const response = await fetch(`${API_BASE_URL}/budget-summary/${year}/${month}`);

      if (!response.ok) {
        // If response is 404, return empty object instead of throwing
        if (response.status === 404) {
          return {};
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch budget data');
      }

      const data = await response.json();

      // Handle empty response
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {};
      }

      // Transform API data to our frontend format
      const transformedData = {};
      data.forEach(category => {
        transformedData[category.name] = {
          id: category.id,
          budget: category.budget,
          items: category.subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            allotted: sub.allotted,
            spending: sub.spending,
            transactions: sub.transactions || []
          }))
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // Return empty object instead of throwing
      return {};
    }
  },

  async createCategory(data) {
    const response = await fetch(
      `${API_BASE_URL}/categories/?month=${data.month}&year=${data.year}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          budget: data.budget
        })
      }
    );
    return handleResponse(response);
  },

  async editCategory(categoryId, data) {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        budget: data.budget
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update category');
    }

    return response.json();
  },

  async deleteCategory(categoryId) {
    console.log('API: Deleting category:', categoryId);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete category');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error deleting category:', error);
      throw error;
    }
  },

  async createSubcategory(data) {
    const response = await fetch(`${API_BASE_URL}/subcategories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async updateSubcategory(id, data) {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async deleteSubcategory(id) {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  async createTransaction(data) {
    const response = await fetch(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: data.description,
        amount: data.amount,
        subcategory_id: data.subcategory_id,
        date: data.date
      })
    });
    return handleResponse(response);
  },

  async updateTransaction(id, data) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async deleteTransaction(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};
