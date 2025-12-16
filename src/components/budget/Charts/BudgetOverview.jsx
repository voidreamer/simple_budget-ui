import React from 'react';
import { useBudget } from '../../../contexts/BudgetContext';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

const BudgetOverview = () => {
  const { state } = useBudget();
  const { isDarkMode } = useTheme();
  const { categories = {} } = state;

  // Transform data for charts
  const chartData = Object.entries(categories || {}).map(([name, data]) => ({
    name,
    Budget: data.budget || 0,
    Allotted: (data.items || []).reduce((sum, item) => sum + (item.allotted || 0), 0),
    Spending: (data.items || []).reduce((sum, item) => sum + (item.spending || 0), 0),
  }));

  // Calculate totals
  const totals = Object.values(categories || {}).reduce((acc, category) => {
    const categorySpending = (category.items || []).reduce((sum, item) => sum + (item.spending || 0), 0);
    const categoryBudget = category.budget || 0;

    return {
      totalBudget: acc.totalBudget + categoryBudget,
      totalSpending: acc.totalSpending + categorySpending
    };
  }, { totalBudget: 0, totalSpending: 0 });

  const remaining = totals.totalBudget - totals.totalSpending;
  const spendingPercentage = totals.totalBudget > 0 
    ? Math.round((totals.totalSpending / totals.totalBudget) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Budget Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-foreground">
                ${totals.totalBudget.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <TrendingDown className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
              <p className="text-2xl font-bold text-foreground">
                ${totals.totalSpending.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">{spendingPercentage}% of budget</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${remaining >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp className={`h-6 w-6 ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${
                remaining >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ${remaining.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="w-full bg-card border border-border">
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }} 
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }} 
                />
                <Tooltip 
                  formatter={(value) => `$${value}`} 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    color: isDarkMode ? 'white' : 'black'
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="hsl(var(--primary))" name="Total Budget" />
                <Bar dataKey="Allotted" fill="#3b82f6" name="Allotted" />
                <Bar dataKey="Spending" fill="#f43f5e" name="Actual Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;