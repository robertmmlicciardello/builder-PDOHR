import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, Users } from "lucide-react";
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
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import {
  Position,
  Department,
  DEFAULT_DEPARTMENTS,
} from "../../shared/hr-system";

interface PositionFormData {
  title: string;
  titleMyanmar: string;
  departmentId: string;
  level: number;
  reportsTo: string;
  responsibilities: string[];
  requirements: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  isActive: boolean;
}

const initialFormData: PositionFormData = {
  title: "",
  titleMyanmar: "",
  departmentId: "",
  level: 1,
  reportsTo: "",
  responsibilities: [],
  requirements: [],
  salaryRange: {
    min: 0,
    max: 0,
  },
  isActive: true,
};

export const PositionManagement: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  // Sample data - in real app, this would come from API
  const [positions, setPositions] = useState<Position[]>([
    {
      id: "pos-001",
      title: "Software Engineer",
      titleMyanmar: "ဆော့ဖ်ဝဲအင်ဂျင်နီယာ",
      departmentId: "dept-tech",
      level: 3,
      reportsTo: "pos-002",
      responsibilities: [
        "Develop and maintain software applications",
        "Code review and testing",
        "Technical documentation",
      ],
      requirements: [
        "Bachelor's degree in Computer Science",
        "3+ years experience in software development",
        "Proficiency in React and Node.js",
      ],
      salaryRange: {
        min: 800000,
        max: 1500000,
      },
      isActive: true,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
    },
    {
      id: "pos-002",
      title: "Senior Software Engineer",
      titleMyanmar: "ဆော့ဖ်ဝဲအင်ဂျင်နီယာအကြီးတန်း",
      departmentId: "dept-tech",
      level: 5,
      reportsTo: "pos-003",
      responsibilities: [
        "Lead development team",
        "Architecture design",
        "Mentoring junior developers",
      ],
      requirements: [
        "Bachelor's degree in Computer Science",
        "5+ years experience in software development",
        "Leadership experience",
      ],
      salaryRange: {
        min: 1500000,
        max: 2500000,
      },
      isActive: true,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
    },
    {
      id: "pos-003",
      title: "Engineering Manager",
      titleMyanmar: "အင်ဂျင်နီယာမန်နေဂျာ",
      departmentId: "dept-tech",
      level: 7,
      responsibilities: [
        "Manage engineering team",
        "Strategic planning",
        "Resource allocation",
      ],
      requirements: [
        "Bachelor's degree in Computer Science or Engineering",
        "8+ years experience with 3+ years in management",
        "Strong leadership and communication skills",
      ],
      salaryRange: {
        min: 2500000,
        max: 4000000,
      },
      isActive: true,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
    },
  ]);

  const [departments] = useState<Department[]>(
    DEFAULT_DEPARTMENTS.map((dept, index) => ({
      ...dept,
      id: `dept-${index + 1}`,
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
    })),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Helper function to get department name
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((d) => d.id === departmentId);
    if (!department) return "Unknown";
    return currentLanguage === "mm" ? department.nameMyanmar : department.name;
  };

  // Helper function to get position title
  const getPositionTitle = (position: Position): string => {
    return currentLanguage === "mm" ? position.titleMyanmar : position.title;
  };

  // Helper function to get reports to position title
  const getReportsToTitle = (positionId: string): string => {
    const position = positions.find((p) => p.id === positionId);
    if (!position) return "";
    return getPositionTitle(position);
  };

  // Filtered and sorted positions
  const filteredPositions = useMemo(() => {
    return positions
      .filter((position) => {
        const matchesSearch =
          position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.titleMyanmar.includes(searchTerm) ||
          getDepartmentName(position.departmentId)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesDepartment =
          filterDepartment === "all" ||
          position.departmentId === filterDepartment;

        const matchesLevel =
          filterLevel === "all" || position.level.toString() === filterLevel;

        return matchesSearch && matchesDepartment && matchesLevel;
      })
      .sort((a, b) => {
        // Sort by department, then by level descending
        const deptA = getDepartmentName(a.departmentId);
        const deptB = getDepartmentName(b.departmentId);
        if (deptA !== deptB) {
          return deptA.localeCompare(deptB);
        }
        return b.level - a.level;
      });
  }, [
    positions,
    searchTerm,
    filterDepartment,
    filterLevel,
    departments,
    currentLanguage,
  ]);

  // Form handling
  const handleInputChange = (field: keyof PositionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryRangeChange = (type: "min" | "max", value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: numValue,
      },
    }));
  };

  const handleArrayFieldChange = (
    field: "responsibilities" | "requirements",
    value: string,
  ) => {
    const items = value.split("\n").filter((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      [field]: items,
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push(t.validation.required + " - " + t.positions.title);
    }
    if (!formData.titleMyanmar.trim()) {
      errors.push(
        t.validation.required + " - " + t.positions.title + " (Myanmar)",
      );
    }
    if (!formData.departmentId) {
      errors.push(t.validation.required + " - " + t.positions.department);
    }
    if (formData.level < 1 || formData.level > 10) {
      errors.push(t.positions.level + " must be between 1 and 10");
    }
    if (formData.salaryRange.min < 0) {
      errors.push("Minimum salary must be positive");
    }
    if (formData.salaryRange.max < formData.salaryRange.min) {
      errors.push("Maximum salary must be greater than minimum salary");
    }
    if (formData.responsibilities.length === 0) {
      errors.push(t.validation.required + " - " + t.positions.responsibilities);
    }
    if (formData.requirements.length === 0) {
      errors.push(t.validation.required + " - " + t.positions.requirements);
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingPosition) {
      // Update existing position
      setPositions((prev) =>
        prev.map((pos) =>
          pos.id === editingPosition.id
            ? {
                ...pos,
                ...formData,
                updatedAt: now,
              }
            : pos,
        ),
      );
    } else {
      // Create new position
      const newPosition: Position = {
        id: `pos-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setPositions((prev) => [...prev, newPosition]);
    }

    handleCloseDialog();
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      title: position.title,
      titleMyanmar: position.titleMyanmar,
      departmentId: position.departmentId,
      level: position.level,
      reportsTo: position.reportsTo || "",
      responsibilities: position.responsibilities,
      requirements: position.requirements,
      salaryRange: position.salaryRange,
      isActive: position.isActive,
    });
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (positionId: string) => {
    setPositions((prev) => prev.filter((pos) => pos.id !== positionId));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPosition(null);
    setFormData(initialFormData);
    setFormErrors([]);
  };

  const handleAddNew = () => {
    setEditingPosition(null);
    setFormData(initialFormData);
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = positions.length;
    const active = positions.filter((p) => p.isActive).length;
    const byDepartment = departments.map((dept) => ({
      name: getDepartmentName(dept.id),
      count: positions.filter((p) => p.departmentId === dept.id).length,
    }));

    return { total, active, byDepartment };
  }, [positions, departments, currentLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {t.positions.management}
            </h1>
            <p className="text-gray-600 mt-1">{t.settings.managePositions}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {t.positions.add}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t.common.total} {t.positions.title}
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
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.status.active}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t.reports.byDepartment}
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.byDepartment.map((dept, index) => (
                  <Badge key={index} variant="secondary">
                    {dept.name}: {dept.count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t.search.placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select
                value={filterDepartment}
                onValueChange={setFilterDepartment}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue
                    placeholder={
                      t.search.filterBy + " " + t.positions.department
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.search.allDepartments}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {getDepartmentName(dept.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder={t.positions.level} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Positions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPositions.map((position) => (
            <Card
              key={position.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {getPositionTitle(position)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getDepartmentName(position.departmentId)}
                    </p>
                  </div>
                  <Badge variant={position.isActive ? "default" : "secondary"}>
                    Level {position.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {position.reportsTo && (
                    <div>
                      <p className="text-xs text-gray-500">
                        {t.positions.reportsTo}
                      </p>
                      <p className="text-sm">
                        {getReportsToTitle(position.reportsTo)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500">
                      {t.positions.salaryRange}
                    </p>
                    <p className="text-sm font-medium">
                      {position.salaryRange.min.toLocaleString()} -{" "}
                      {position.salaryRange.max.toLocaleString()} MMK
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      {t.positions.responsibilities}
                    </p>
                    <p className="text-sm">
                      {position.responsibilities.length} items
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      {t.positions.requirements}
                    </p>
                    <p className="text-sm">
                      {position.requirements.length} items
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant={position.isActive ? "default" : "secondary"}
                    >
                      {position.isActive ? t.status.active : t.status.inactive}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(position)}
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
                              {t.actions.delete} "{getPositionTitle(position)}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t.actions.cancel}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(position.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t.actions.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPositions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">{t.search.noResults}</p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Position Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPosition
                  ? t.positions.editPosition
                  : t.positions.createPosition}
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
                  <Label htmlFor="title">{t.positions.title} (English) *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="titleMyanmar">
                    {t.positions.title} (Myanmar) *
                  </Label>
                  <Input
                    id="titleMyanmar"
                    value={formData.titleMyanmar}
                    onChange={(e) =>
                      handleInputChange("titleMyanmar", e.target.value)
                    }
                    placeholder="ဆော့ဖ်ဝဲအင်ဂျင်နီယာ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">{t.positions.department} *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      handleInputChange("departmentId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t.actions.filter + " " + t.positions.department
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {getDepartmentName(dept.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">{t.positions.level} (1-10) *</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={(e) =>
                      handleInputChange("level", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reportsTo">{t.positions.reportsTo}</Label>
                <Select
                  value={formData.reportsTo}
                  onValueChange={(value) =>
                    handleInputChange("reportsTo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {positions
                      .filter((p) => p.id !== editingPosition?.id)
                      .map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {getPositionTitle(position)} (Level {position.level})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary (MMK) *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryRange.min}
                    onChange={(e) =>
                      handleSalaryRangeChange("min", e.target.value)
                    }
                    placeholder="800000"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum Salary (MMK) *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryRange.max}
                    onChange={(e) =>
                      handleSalaryRangeChange("max", e.target.value)
                    }
                    placeholder="1500000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="responsibilities">
                  {t.positions.responsibilities} * (one per line)
                </Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities.join("\n")}
                  onChange={(e) =>
                    handleArrayFieldChange("responsibilities", e.target.value)
                  }
                  placeholder="Develop software applications&#10;Code review and testing&#10;Technical documentation"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="requirements">
                  {t.positions.requirements} * (one per line)
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements.join("\n")}
                  onChange={(e) =>
                    handleArrayFieldChange("requirements", e.target.value)
                  }
                  placeholder="Bachelor's degree in Computer Science&#10;3+ years experience&#10;Proficiency in React and Node.js"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">{t.positions.isActive}</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  {t.actions.cancel}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPosition ? t.actions.update : t.actions.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PositionManagement;
