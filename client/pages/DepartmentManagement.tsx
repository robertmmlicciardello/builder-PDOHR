import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Users, Building } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Department, DEFAULT_DEPARTMENTS } from "../../shared/hr-system";

interface DepartmentFormData {
  name: string;
  nameMyanmar: string;
  description: string;
  parentDepartmentId: string;
  headOfDepartment: string;
  budget: number;
  location: string;
  isActive: boolean;
}

const initialFormData: DepartmentFormData = {
  name: "",
  nameMyanmar: "",
  description: "",
  parentDepartmentId: "none",
  headOfDepartment: "",
  budget: 0,
  location: "",
  isActive: true,
};

export const DepartmentManagement: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  // Sample data - in real app, this would come from API
  const [departments, setDepartments] = useState<Department[]>(
    DEFAULT_DEPARTMENTS.map((dept, index) => ({
      ...dept,
      id: `dept-${index + 1}`,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
    })),
  );

  // Sample employees for head of department selection
  const [employees] = useState([
    { id: "emp-001", name: "John Doe", nameMyanmar: "ဂျွန်ဒိုး" },
    { id: "emp-002", name: "Jane Smith", nameMyanmar: "ဂျိန်းစမစ်" },
    { id: "emp-003", name: "Bob Johnson", nameMyanmar: "ဘောဘ်ဂျွန်ဆင်" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Helper function to get department name
  const getDepartmentName = (department: Department): string => {
    return currentLanguage === "mm" ? department.nameMyanmar : department.name;
  };

  // Helper function to get employee name
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return "";
    return currentLanguage === "mm" ? employee.nameMyanmar : employee.name;
  };

  // Helper function to get parent department name
  const getParentDepartmentName = (departmentId: string): string => {
    const department = departments.find((d) => d.id === departmentId);
    if (!department) return "";
    return getDepartmentName(department);
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments
      .filter((department) => {
        const matchesSearch =
          department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.nameMyanmar.includes(searchTerm) ||
          (department.description &&
            department.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        return matchesSearch;
      })
      .sort((a, b) => {
        // Sort by name
        const nameA = getDepartmentName(a);
        const nameB = getDepartmentName(b);
        return nameA.localeCompare(nameB);
      });
  }, [departments, searchTerm, currentLanguage]);

  // Form handling
  const handleInputChange = (field: keyof DepartmentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push(t.validation.required + " - " + t.common.name + " (English)");
    }
    if (!formData.nameMyanmar.trim()) {
      errors.push(t.validation.required + " - " + t.common.name + " (Myanmar)");
    }
    if (formData.budget < 0) {
      errors.push("Budget must be positive");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    // Convert 'none' to undefined for parentDepartmentId field
    const processedFormData = {
      ...formData,
      parentDepartmentId:
        formData.parentDepartmentId === "none"
          ? undefined
          : formData.parentDepartmentId,
      headOfDepartment: formData.headOfDepartment || undefined,
    };

    if (editingDepartment) {
      // Update existing department
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartment.id
            ? {
                ...dept,
                ...processedFormData,
                updatedAt: now,
              }
            : dept,
        ),
      );
    } else {
      // Create new department
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        ...processedFormData,
        createdAt: now,
        updatedAt: now,
      };
      setDepartments((prev) => [...prev, newDepartment]);
    }

    handleCloseDialog();
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      nameMyanmar: department.nameMyanmar,
      description: department.description || "",
      parentDepartmentId: department.parentDepartmentId || "none",
      headOfDepartment: department.headOfDepartment || "",
      budget: department.budget || 0,
      location: department.location || "",
      isActive: department.isActive,
    });
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (departmentId: string) => {
    setDepartments((prev) => prev.filter((dept) => dept.id !== departmentId));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData(initialFormData);
    setFormErrors([]);
  };

  const handleAddNew = () => {
    setEditingDepartment(null);
    setFormData(initialFormData);
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.isActive).length;
    const totalBudget = departments.reduce(
      (sum, dept) => sum + (dept.budget || 0),
      0,
    );

    return { total, active, totalBudget };
  }, [departments]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {t.settings.manageDepartments}
            </h1>
            <p className="text-gray-600 mt-1">{t.organizations.departments}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {t.settings.addDepartment}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t.common.total} {t.organizations.departments}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.status.active}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t.common.total} Budget
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalBudget.toLocaleString()} MMK
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.search.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <Card
              key={department.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {getDepartmentName(department)}
                    </CardTitle>
                    {department.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {department.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={department.isActive ? "default" : "secondary"}
                  >
                    {department.isActive ? t.status.active : t.status.inactive}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {department.parentDepartmentId && (
                    <div>
                      <p className="text-xs text-gray-500">Parent Department</p>
                      <p className="text-sm">
                        {getParentDepartmentName(department.parentDepartmentId)}
                      </p>
                    </div>
                  )}

                  {department.headOfDepartment && (
                    <div>
                      <p className="text-xs text-gray-500">
                        Head of Department
                      </p>
                      <p className="text-sm">
                        {getEmployeeName(department.headOfDepartment)}
                      </p>
                    </div>
                  )}

                  {department.budget && (
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-medium">
                        {department.budget.toLocaleString()} MMK
                      </p>
                    </div>
                  )}

                  {department.location && (
                    <div>
                      <p className="text-xs text-gray-500">
                        {t.common.address}
                      </p>
                      <p className="text-sm">{department.location}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t.messages.confirmDelete}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.actions.delete} "{getDepartmentName(department)}
                            "?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t.actions.cancel}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(department.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t.actions.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">{t.search.noResults}</p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Department Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment
                  ? t.actions.edit + " " + t.personnel.department
                  : t.actions.create + " " + t.personnel.department}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <ul className="text-sm text-red-600 space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t.common.name} (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Technology Workshop"
                  />
                </div>
                <div>
                  <Label htmlFor="nameMyanmar">
                    {t.common.name} (Myanmar) *
                  </Label>
                  <Input
                    id="nameMyanmar"
                    value={formData.nameMyanmar}
                    onChange={(e) =>
                      handleInputChange("nameMyanmar", e.target.value)
                    }
                    placeholder="နည်းပညာလက်ရုံးတပ်"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t.common.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Department description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentDepartment">Parent Department</Label>
                  <select
                    id="parentDepartment"
                    value={formData.parentDepartmentId}
                    onChange={(e) =>
                      handleInputChange("parentDepartmentId", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="none">None</option>
                    {departments
                      .filter((d) => d.id !== editingDepartment?.id)
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {getDepartmentName(dept)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="headOfDepartment">Head of Department</Label>
                  <select
                    id="headOfDepartment"
                    value={formData.headOfDepartment}
                    onChange={(e) =>
                      handleInputChange("headOfDepartment", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">None</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {getEmployeeName(emp)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget (MMK)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", parseInt(e.target.value) || 0)
                    }
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="location">{t.common.address}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Building A, Floor 3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">{t.status.active}</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  {t.actions.cancel}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingDepartment ? t.actions.update : t.actions.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DepartmentManagement;
