import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Check } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  IncomeCategory,
  IncomeType,
  DEFAULT_INCOME_CATEGORIES,
  validateIncomeCategory,
} from "../../shared/income-system";

export default function IncomeCategorySettings() {
  const [categories, setCategories] = useState<IncomeCategory[]>(
    DEFAULT_INCOME_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: `cat-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<IncomeCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    nameMyanmar: "",
    description: "",
    incomeType: "" as IncomeType | "",
    isActive: true,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleOpenDialog = (category?: IncomeCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameMyanmar: category.nameMyanmar,
        description: category.description || "",
        incomeType: category.incomeType,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        nameMyanmar: "",
        description: "",
        incomeType: "",
        isActive: true,
      });
    }
    setErrors([]);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const validationErrors = validateIncomeCategory({
      ...formData,
      incomeType: formData.incomeType as IncomeType,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const now = new Date().toISOString();

    if (editingCategory) {
      // Update existing category
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: formData.name,
                nameMyanmar: formData.nameMyanmar,
                description: formData.description,
                incomeType: formData.incomeType as IncomeType,
                isActive: formData.isActive,
                updatedAt: now,
              }
            : cat,
        ),
      );
    } else {
      // Add new category
      const newCategory: IncomeCategory = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        nameMyanmar: formData.nameMyanmar,
        description: formData.description,
        incomeType: formData.incomeType as IncomeType,
        isActive: formData.isActive,
        createdAt: now,
        updatedAt: now,
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setErrors([]);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id),
      );
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const toggleStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              isActive: !cat.isActive,
              updatedAt: new Date().toISOString(),
            }
          : cat,
      ),
    );
  };

  const getIncomeTypeColor = (type: IncomeType) => {
    return type === "tax"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const taxCategories = categories.filter((cat) => cat.incomeType === "tax");
  const donationCategories = categories.filter(
    (cat) => cat.incomeType === "donation",
  );

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin-settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Settings
                </Button>
              </Link>
              <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Income Category Management
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  Manage income and donation categories
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tax Income Categories */}
          <Card className="border-myanmar-red/20">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                Tax Income Categories ({taxCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-500">
                            {category.nameMyanmar}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(category.id)}
                            className="border-gray-300"
                          >
                            {category.isActive ? (
                              <X className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(category)}
                            className="border-myanmar-red text-myanmar-red"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setDeleteDialogOpen(true);
                            }}
                            className="border-red-500 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Donation Categories */}
          <Card className="border-myanmar-red/20">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                Donation Categories ({donationCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-500">
                            {category.nameMyanmar}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(category.id)}
                            className="border-gray-300"
                          >
                            {category.isActive ? (
                              <X className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(category)}
                            className="border-myanmar-red text-myanmar-red"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setDeleteDialogOpen(true);
                            }}
                            className="border-red-500 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <ul className="text-red-600 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <Label htmlFor="name">Name (English) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Category name in English"
              />
            </div>

            <div>
              <Label htmlFor="nameMyanmar">Name (Myanmar) *</Label>
              <Input
                id="nameMyanmar"
                value={formData.nameMyanmar}
                onChange={(e) =>
                  setFormData({ ...formData, nameMyanmar: e.target.value })
                }
                placeholder="Category name in Myanmar"
              />
            </div>

            <div>
              <Label htmlFor="incomeType">Income Type *</Label>
              <Select
                value={formData.incomeType}
                onValueChange={(value) =>
                  setFormData({ ...formData, incomeType: value as IncomeType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select income type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax">Tax Income</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-myanmar-red hover:bg-myanmar-red-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
