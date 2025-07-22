import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Check,
  MinusCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

// Define outcome category interface
export interface OutcomeCategory {
  id: string;
  name: string;
  nameMyanmar: string;
  description?: string;
  descriptionMyanmar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default outcome categories
const DEFAULT_OUTCOME_CATEGORIES: Omit<
  OutcomeCategory,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Office Supplies",
    nameMyanmar: "ရုံးသုံးပစ္စည်းများ",
    description: "Stationery, office equipment, and supplies",
    descriptionMyanmar: "စာရေးကိရိယာများ၊ ရုံးသုံးစက်ပစ္စည်းများ",
    isActive: true,
  },
  {
    name: "Utilities",
    nameMyanmar: "သုံးစွဲခများ",
    description: "Electricity, water, internet, and other utilities",
    descriptionMyanmar: "လျှပ်စစ်ဓာတ်အား၊ ရေ၊ အ��်တာနက်နှင့် အခြားသုံးစွဲခများ",
    isActive: true,
  },
  {
    name: "Transportation",
    nameMyanmar: "သယ်ယူပို့ဆောင်ရေး",
    description: "Vehicle maintenance, fuel, and travel expenses",
    descriptionMyanmar: "ယာဉ်ပြုပြင်ခ၊ လောင်စာဆီနှင့် ခရီးစရိတ်များ",
    isActive: true,
  },
  {
    name: "Maintenance",
    nameMyanmar: "ပြုပြင်ထိန်းသိမ်းခ",
    description: "Building and equipment maintenance",
    descriptionMyanmar: "အဆောက်အအုံနှင့် စက်ပစ္စည်းပြုပြင်ခ",
    isActive: true,
  },
  {
    name: "Training & Development",
    nameMyanmar: "လေ့ကျင့်မှုနှင့် ဖွံ့ဖြိုးတိုးတက်မှု",
    description: "Staff training and professional development",
    descriptionMyanmar: "ဝန်ထမ်းလေ့ကျင့်မှုနှင့် အတတ်ပညာဖွံ့ဖြိုးမှု",
    isActive: true,
  },
  {
    name: "Equipment",
    nameMyanmar: "စက်ပစ္စည်းများ",
    description: "Purchase of equipment and tools",
    descriptionMyanmar: "စက်ပစ္စည်းနှင့် ကိရိယာတန်ဆာပလာများ ဝယ်ယူခ",
    isActive: true,
  },
];

// Validation function
const validateOutcomeCategory = (
  category: Partial<OutcomeCategory>,
): string[] => {
  const errors: string[] = [];

  if (!category.name?.trim()) {
    errors.push("Category name is required");
  }

  if (!category.nameMyanmar?.trim()) {
    errors.push("Myanmar name is required");
  }

  return errors;
};

export default function OutcomeCategorySettings() {
  const [categories, setCategories] = useState<OutcomeCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<OutcomeCategory | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] =
    useState<OutcomeCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameMyanmar: "",
    description: "",
    descriptionMyanmar: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load categories from localStorage or initialize with defaults
  useEffect(() => {
    const loadCategories = () => {
      try {
        const stored = localStorage.getItem("outcome-categories");
        if (stored) {
          setCategories(JSON.parse(stored));
        } else {
          // Initialize with default categories
          const defaultCategories: OutcomeCategory[] =
            DEFAULT_OUTCOME_CATEGORIES.map((cat, index) => ({
              ...cat,
              id: `outcome-${index + 1}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
          setCategories(defaultCategories);
          localStorage.setItem(
            "outcome-categories",
            JSON.stringify(defaultCategories),
          );
        }
      } catch (error) {
        console.error("Failed to load outcome categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Save categories to localStorage
  const saveCategories = (newCategories: OutcomeCategory[]) => {
    try {
      localStorage.setItem("outcome-categories", JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error("Failed to save outcome categories:", error);
    }
  };

  const handleOpenDialog = (category?: OutcomeCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameMyanmar: category.nameMyanmar,
        description: category.description || "",
        descriptionMyanmar: category.descriptionMyanmar || "",
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        nameMyanmar: "",
        description: "",
        descriptionMyanmar: "",
        isActive: true,
      });
    }
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      nameMyanmar: "",
      description: "",
      descriptionMyanmar: "",
      isActive: true,
    });
    setFormErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateOutcomeCategory(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();

      if (editingCategory) {
        // Update existing category
        const updatedCategories = categories.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData, updatedAt: now }
            : cat,
        );
        saveCategories(updatedCategories);
      } else {
        // Create new category
        const newCategory: OutcomeCategory = {
          id: `outcome-${Date.now()}`,
          ...formData,
          createdAt: now,
          updatedAt: now,
        };
        saveCategories([...categories, newCategory]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save category:", error);
      setFormErrors(["Failed to save category. Please try again."]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (category: OutcomeCategory) => {
    setDeleteConfirmCategory(category);
  };

  const confirmDelete = () => {
    if (deleteConfirmCategory) {
      const updatedCategories = categories.filter(
        (cat) => cat.id !== deleteConfirmCategory.id,
      );
      saveCategories(updatedCategories);
      setDeleteConfirmCategory(null);
    }
  };

  const toggleCategoryStatus = (category: OutcomeCategory) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === category.id
        ? {
            ...cat,
            isActive: !cat.isActive,
            updatedAt: new Date().toISOString(),
          }
        : cat,
    );
    saveCategories(updatedCategories);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-myanmar-red"></div>
          <p className="mt-4 text-myanmar-gray-dark">
            Loading outcome categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin-settings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Settings
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Outcome Category Settings
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  Manage outcome categories and types
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-myanmar-red hover:bg-myanmar-red/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MinusCircle className="h-5 w-5 text-red-600" />
              Outcome Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <MinusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-myanmar-gray-dark">
                  No outcome categories found
                </p>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="mt-4 bg-myanmar-red hover:bg-myanmar-red/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Myanmar Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.nameMyanmar}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={category.description}>
                          {category.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                          className={
                            category.isActive ? "bg-green-600" : "bg-gray-500"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryStatus(category)}
                          >
                            {category.isActive ? (
                              <X className="w-4 h-4 text-red-600" />
                            ) : (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Category Name (English) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameMyanmar">Category Name (Myanmar) *</Label>
                <Input
                  id="nameMyanmar"
                  value={formData.nameMyanmar}
                  onChange={(e) =>
                    setFormData({ ...formData, nameMyanmar: e.target.value })
                  }
                  placeholder="e.g., ရုံးသုံးပစ္စည်းများ"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="descriptionMyanmar">
                  Description (Myanmar)
                </Label>
                <Textarea
                  id="descriptionMyanmar"
                  value={formData.descriptionMyanmar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriptionMyanmar: e.target.value,
                    })
                  }
                  placeholder="ဤအမျိုးအစားအတွက် အကျဉ်းချုပ်ဖော်ပြချက်..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <Label htmlFor="isActive">Active Category</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-myanmar-red hover:bg-myanmar-red/90"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmCategory}
        onOpenChange={() => setDeleteConfirmCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmCategory?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
