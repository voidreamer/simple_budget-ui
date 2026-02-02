import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronRight, FileText, Save, Sparkles, Trash2 } from 'lucide-react';

const BUILT_IN_TEMPLATES = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Basic budget with necessities, fixed expenses, and savings',
    builtIn: true,
    categories: [
      {
        name: 'Necessities',
        budget: 0,
        subcategories: [
          { name: 'Groceries', allotted: 0 },
          { name: 'Transportation', allotted: 0 },
          { name: 'Healthcare', allotted: 0 },
          { name: 'Personal Care', allotted: 0 },
        ],
      },
      {
        name: 'Fixed Expenses',
        budget: 0,
        subcategories: [
          { name: 'Rent / Mortgage', allotted: 0 },
          { name: 'Utilities', allotted: 0 },
          { name: 'Insurance', allotted: 0 },
          { name: 'Phone & Internet', allotted: 0 },
        ],
      },
      {
        name: 'Savings',
        budget: 0,
        subcategories: [
          { name: 'Emergency Fund', allotted: 0 },
          { name: 'Retirement', allotted: 0 },
          { name: 'Investments', allotted: 0 },
        ],
      },
    ],
  },
  {
    id: 'household',
    name: 'Household',
    description: 'Household-focused budget with home maintenance and family expenses',
    builtIn: true,
    categories: [
      {
        name: 'Home & Maintenance',
        budget: 0,
        subcategories: [
          { name: 'Repairs', allotted: 0 },
          { name: 'Cleaning Supplies', allotted: 0 },
          { name: 'Furniture', allotted: 0 },
          { name: 'Garden & Lawn', allotted: 0 },
        ],
      },
      {
        name: 'Family & Kids',
        budget: 0,
        subcategories: [
          { name: 'Childcare', allotted: 0 },
          { name: 'School Supplies', allotted: 0 },
          { name: 'Activities', allotted: 0 },
          { name: 'Clothing', allotted: 0 },
        ],
      },
      {
        name: 'Food & Dining',
        budget: 0,
        subcategories: [
          { name: 'Groceries', allotted: 0 },
          { name: 'Dining Out', allotted: 0 },
          { name: 'Coffee & Snacks', allotted: 0 },
        ],
      },
    ],
  },
];

const STORAGE_KEY = 'simplebudget_templates';

const getSavedTemplates = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveTemplates = (templates) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

const TemplatesModal = ({ isOpen, onClose, categories, selectedDate, onApply }) => {
  const [activeTab, setActiveTab] = useState('apply');
  const [savedTemplates, setSavedTemplates] = useState(getSavedTemplates);

  // Apply tab state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [checkedCategories, setCheckedCategories] = useState({});
  const [expandedTemplates, setExpandedTemplates] = useState({});
  const [applying, setApplying] = useState(false);

  // Save tab state
  const [templateName, setTemplateName] = useState('');
  const [saveChecked, setSaveChecked] = useState({});

  const allTemplates = useMemo(() => [...BUILT_IN_TEMPLATES, ...savedTemplates], [savedTemplates]);

  const categoryEntries = useMemo(() => Object.entries(categories || {}), [categories]);

  // Apply tab handlers
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    const checked = {};
    template.categories.forEach((_, i) => { checked[i] = true; });
    setCheckedCategories(checked);
  };

  const toggleExpand = (id) => {
    setExpandedTemplates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    const selected = selectedTemplate.categories.filter((_, i) => checkedCategories[i]);
    if (selected.length === 0) return;

    setApplying(true);
    try {
      await onApply(selected);
      onClose();
    } catch (e) {
      console.error('Failed to apply template:', e);
    } finally {
      setApplying(false);
    }
  };

  // Save tab handlers
  const handleSave = () => {
    if (!templateName.trim()) return;
    const selected = categoryEntries.filter((_, i) => saveChecked[i]);
    if (selected.length === 0) return;

    const newTemplate = {
      id: `custom_${Date.now()}`,
      name: templateName.trim(),
      description: `Saved from ${selectedDate}`,
      builtIn: false,
      categories: selected.map(([name, cat]) => ({
        name,
        budget: cat.budget || 0,
        subcategories: (cat.items || []).map(sub => ({
          name: sub.name,
          allotted: sub.allotted || 0,
        })),
      })),
    };

    const updated = [...savedTemplates, newTemplate];
    saveTemplates(updated);
    setSavedTemplates(updated);
    setTemplateName('');
    setSaveChecked({});
    setActiveTab('apply');
  };

  const deleteTemplate = (id) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    saveTemplates(updated);
    setSavedTemplates(updated);
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
      setCheckedCategories({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Budget Templates
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
          {[
            { key: 'apply', label: 'Apply Template', icon: FileText },
            { key: 'save', label: 'Save as Template', icon: Save },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
          <AnimatePresence mode="wait">
            {activeTab === 'apply' ? (
              <motion.div
                key="apply"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {allTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  const isExpanded = expandedTemplates[template.id];

                  return (
                    <div
                      key={template.id}
                      className={`rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary/50 bg-primary/5 shadow-sm'
                          : 'border-border/50 hover:border-border bg-background/50'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 p-3"
                        onClick={() => selectTemplate(template)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{template.name}</span>
                            {template.builtIn && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Built-in</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!template.builtIn && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(template.id); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2">
                              {template.categories.map((cat, i) => (
                                <div key={i} className="rounded-lg bg-muted/30 p-2.5">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    {isSelected && (
                                      <input
                                        type="checkbox"
                                        checked={!!checkedCategories[i]}
                                        onChange={() => setCheckedCategories(prev => ({ ...prev, [i]: !prev[i] }))}
                                        className="rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
                                      />
                                    )}
                                    <span className="text-sm font-medium">{cat.name}</span>
                                    {cat.budget > 0 && (
                                      <span className="text-xs text-muted-foreground">${cat.budget}</span>
                                    )}
                                  </label>
                                  <div className="ml-6 mt-1 flex flex-wrap gap-1">
                                    {cat.subcategories.map((sub, j) => (
                                      <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border/50 text-muted-foreground">
                                        {sub.name}{sub.allotted > 0 ? ` · $${sub.allotted}` : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {allTemplates.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No templates available. Save one from your current month!</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <Input
                  placeholder="Template name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="rounded-xl"
                />

                {categoryEntries.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No categories in current month to save.</p>
                ) : (
                  categoryEntries.map(([name, cat], i) => (
                    <label
                      key={name}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        saveChecked[i] ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-background/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!saveChecked[i]}
                        onChange={() => setSaveChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="mt-0.5 rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{name}</span>
                          {(cat.budget || 0) > 0 && (
                            <span className="text-xs text-muted-foreground">${cat.budget}</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(cat.items || []).map((sub, j) => (
                            <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground">
                              {sub.name}{sub.allotted > 0 ? ` · $${sub.allotted}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50">
          {activeTab === 'apply' ? (
            <Button
              onClick={handleApply}
              disabled={!selectedTemplate || Object.values(checkedCategories).filter(Boolean).length === 0 || applying}
              className="w-full rounded-xl gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {applying ? 'Applying...' : `Apply to ${selectedDate}`}
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!templateName.trim() || Object.values(saveChecked).filter(Boolean).length === 0}
              className="w-full rounded-xl gap-2"
            >
              <Save className="w-4 h-4" />
              Save Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesModal;
