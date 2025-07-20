import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  PieChart,
  FileText,
  Download,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  IncomeRecord,
  IncomeType,
  IncomeStatus,
  IncomeCategory,
  DEFAULT_INCOME_CATEGORIES,
  calculateTotalIncome,
  groupIncomeByType,
  formatCurrency,
  getIncomeTypeLabel,
  getIncomeStatusLabel,
  validateIncomeRecord,
} from "../../shared/income-system";

interface IncomeFormData {
  incomeType: IncomeType;
  amount: number;
  currency: string;
  description: string;
  descriptionMyanmar: string;
  source: string;
  sourceMyanmar: string;
  dateReceived: string;
  receivedBy: string;
  categoryId: string;
  status: IncomeStatus;
  documentUrl: string;
  notes: string;
}

const initialFormData: IncomeFormData = {
  incomeType: "tax",
  amount: 0,
  currency: "MMK",
  description: "",
  descriptionMyanmar: "",
  source: "",
  sourceMyanmar: "",
  dateReceived: new Date().toISOString().split("T")[0],
  receivedBy: "",
  categoryId: "",
  status: "pending",
  documentUrl: "",
  notes: "",
};

export const IncomeManagement: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  // Sample data - in real app, this would come from API
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([
    {
      id: "inc-001",
      incomeType: "tax",
      amount: 5000000,
      currency: "MMK",
      description: "Monthly income tax collection",
      descriptionMyanmar: "လစဉ် ဝင်ငွေခွန် ကောက်ခံမှု",
      source: "Yangon Regional Office",
      sourceMyanmar: "ရန်ကုန်တိုင်း ရုံးချုပ်",
      dateReceived: "2024-01-15",
      receivedBy: "emp-001",
      category: {
        id: "cat-001",
        name: "Income Tax",
        nameMyanmar: "ဝင်ငွေခွန်",
        incomeType: "tax",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      status: "approved",
      notes: "Regular monthly collection",
      approvedBy: "emp-002",
      approvedDate: "2024-01-16T00:00:00.000Z",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-16T00:00:00.000Z",
    },
    {
      id: "inc-002",
      incomeType: "donation",
      amount: 2000000,
      currency: "MMK",
      description: "Community development donation",
      descriptionMyanmar: "လူမှုဖွံ့ဖြိုးတိုးတက်မှု အလှူငွေ",
      source: "Local Business Association",
      sourceMyanmar: "ဒေသခံ စီးပွားရေးအသင်း",
      dateReceived: "2024-01-20",
      receivedBy: "emp-003",
      category: {
        id: "cat-002",
        name: "Community Donations",
        nameMyanmar: "လူမှုအလှူ",
        incomeType: "donation",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      status: "approved",
      notes: "Quarterly donation for infrastructure",
      approvedBy: "emp-002",
      approvedDate: "2024-01-21T00:00:00.000Z",
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: "2024-01-21T00:00:00.000Z",
    },
    {
      id: "inc-003",
      incomeType: "tax",
      amount: 1500000,
      currency: "MMK",
      description: "Commercial tax collection",
      descriptionMyanmar: "စီးပွားရေးခွန် ကောက်ခံမှု",
      source: "Mandalay Commercial Zone",
      sourceMyanmar: "မန္တလေး စီးပွားရေးဇုန်",
      dateReceived: "2024-01-25",
      receivedBy: "emp-004",
      category: {
        id: "cat-003",
        name: "Commercial Tax",
        nameMyanmar: "စီးပွားရေးခွန်",
        incomeType: "tax",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      status: "verified",
      notes: "Pending final approval",
      createdAt: "2024-01-25T00:00:00.000Z",
      updatedAt: "2024-01-25T00:00:00.000Z",
    },
  ]);

  const [categories] = useState<IncomeCategory[]>(
    DEFAULT_INCOME_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: `cat-${index + 1}`,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    })),
  );

  const [employees] = useState([
    { id: "emp-001", name: "John Doe", nameMyanmar: "ဂျွန်ဒိုး" },
    { id: "emp-002", name: "Jane Smith", nameMyanmar: "ဂျိန်းစမစ်" },
    { id: "emp-003", name: "Bob Johnson", nameMyanmar: "ဘောဘ်ဂျွန်ဆင်" },
    { id: "emp-004", name: "Alice Brown", nameMyanmar: "အဲလစ်ဘရောင်း" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("thisMonth");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [formData, setFormData] = useState<IncomeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Helper functions
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return "Unknown";
    return currentLanguage === "mm" ? employee.nameMyanmar : employee.name;
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "Unknown";
    return currentLanguage === "mm" ? category.nameMyanmar : category.name;
  };

  const getStatusColor = (status: IncomeStatus): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return incomeRecords
      .filter((record) => {
        const matchesSearch =
          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.descriptionMyanmar.includes(searchTerm) ||
          record.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.sourceMyanmar.includes(searchTerm);

        const matchesType =
          filterType === "all" || record.incomeType === filterType;

        const matchesStatus =
          filterStatus === "all" || record.status === filterStatus;

        // Period filter logic would be implemented here
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.dateReceived).getTime() -
          new Date(a.dateReceived).getTime(),
      );
  }, [incomeRecords, searchTerm, filterType, filterStatus, filterPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const { taxIncome, donationIncome } = groupIncomeByType(incomeRecords);

    const totalTaxIncome = calculateTotalIncome(taxIncome);
    const totalDonationIncome = calculateTotalIncome(donationIncome);
    const totalIncome = totalTaxIncome + totalDonationIncome;

    const pendingRecords = incomeRecords.filter(
      (r) => r.status === "pending",
    ).length;
    const approvedRecords = incomeRecords.filter(
      (r) => r.status === "approved",
    ).length;

    return {
      totalIncome,
      totalTaxIncome,
      totalDonationIncome,
      totalRecords: incomeRecords.length,
      pendingRecords,
      approvedRecords,
      taxPercentage: totalIncome > 0 ? (totalTaxIncome / totalIncome) * 100 : 0,
      donationPercentage:
        totalIncome > 0 ? (totalDonationIncome / totalIncome) * 100 : 0,
    };
  }, [incomeRecords]);

  // Form handling
  const handleInputChange = (field: keyof IncomeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors = validateIncomeRecord(formData);
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingRecord) {
      // Update existing record
      setIncomeRecords((prev) =>
        prev.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...formData,
                category: categories.find((c) => c.id === formData.categoryId)!,
                updatedAt: now,
              }
            : record,
        ),
      );
    } else {
      // Create new record
      const newRecord: IncomeRecord = {
        id: `inc-${Date.now()}`,
        ...formData,
        category: categories.find((c) => c.id === formData.categoryId)!,
        createdAt: now,
        updatedAt: now,
      };
      setIncomeRecords((prev) => [...prev, newRecord]);
    }

    handleCloseDialog();
  };

  const handleEdit = (record: IncomeRecord) => {
    setEditingRecord(record);
    setFormData({
      incomeType: record.incomeType,
      amount: record.amount,
      currency: record.currency,
      description: record.description,
      descriptionMyanmar: record.descriptionMyanmar,
      source: record.source,
      sourceMyanmar: record.sourceMyanmar,
      dateReceived: record.dateReceived,
      receivedBy: record.receivedBy,
      categoryId: record.category.id,
      status: record.status,
      documentUrl: record.documentUrl || "",
      notes: record.notes || "",
    });
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (recordId: string) => {
    setIncomeRecords((prev) => prev.filter((record) => record.id !== recordId));
  };

  const handleStatusUpdate = (recordId: string, newStatus: IncomeStatus) => {
    const now = new Date().toISOString();
    setIncomeRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: newStatus,
              approvedBy: newStatus === "approved" ? "emp-002" : undefined,
              approvedDate: newStatus === "approved" ? now : undefined,
              updatedAt: now,
            }
          : record,
      ),
    );
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecord(null);
    setFormData(initialFormData);
    setFormErrors([]);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData(initialFormData);
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t.nav.back}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Income Management
              </h1>
              <p className="text-gray-600 mt-1">
                Tax Income & Donation Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Income</p>
                  <p className="text-green-100 text-xs">စুစုပေါင်းဝင်ငွေ</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Tax Income</p>
                  <p className="text-blue-100 text-xs">အခွန်ဝင်ငွေ</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(stats.totalTaxIncome)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${stats.taxPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-blue-100">
                      {stats.taxPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Donation Income</p>
                  <p className="text-purple-100 text-xs">အလှူဝင်ငွေ</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(stats.totalDonationIncome)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${stats.donationPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-purple-100">
                      {stats.donationPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <PieChart className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Records</p>
                  <p className="text-orange-100 text-xs">မှတ်တမ်းများ</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.totalRecords}
                  </p>
                  <div className="mt-2 text-xs">
                    <span className="text-orange-100">
                      {stats.pendingRecords} pending • {stats.approvedRecords}{" "}
                      approved
                    </span>
                  </div>
                </div>
                <FileText className="h-12 w-12 text-orange-200" />
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
                    placeholder="Search by description, source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tax">Tax Income</SelectItem>
                  <SelectItem value="donation">Donation Income</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Income Records List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          record.incomeType === "tax" ? "default" : "secondary"
                        }
                        className={
                          record.incomeType === "tax"
                            ? "bg-blue-600"
                            : "bg-purple-600"
                        }
                      >
                        {getIncomeTypeLabel(record.incomeType, currentLanguage)}
                      </Badge>
                      <Badge className={getStatusColor(record.status)}>
                        {getIncomeStatusLabel(record.status, currentLanguage)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {currentLanguage === "mm"
                        ? record.descriptionMyanmar
                        : record.description}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentLanguage === "mm"
                        ? record.sourceMyanmar
                        : record.source}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(record.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.dateReceived).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm">
                      {getCategoryName(record.category.id)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Received By</p>
                    <p className="text-sm">
                      {getEmployeeName(record.receivedBy)}
                    </p>
                  </div>

                  {record.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm line-clamp-2">{record.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-1">
                      {record.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(record.id, "verified")
                            }
                            className="text-blue-600 border-blue-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(record.id, "rejected")
                            }
                            className="text-red-600 border-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {record.status === "verified" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(record.id, "approved")
                          }
                          className="text-green-600 border-green-600"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
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
                              Delete Income Record
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this income
                              record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
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

        {filteredRecords.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No income records found</p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Income Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? "Edit Income Record" : "Add Income Record"}
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
                  <Label htmlFor="incomeType">Income Type *</Label>
                  <Select
                    value={formData.incomeType}
                    onValueChange={(value) =>
                      handleInputChange("incomeType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax Income</SelectItem>
                      <SelectItem value="donation">Donation Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat.incomeType === formData.incomeType)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {getCategoryName(cat.id)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (MMK) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", parseInt(e.target.value) || 0)
                    }
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <Label htmlFor="dateReceived">Date Received *</Label>
                  <Input
                    id="dateReceived"
                    type="date"
                    value={formData.dateReceived}
                    onChange={(e) =>
                      handleInputChange("dateReceived", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description (English) *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Monthly income tax collection"
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionMyanmar">
                    Description (Myanmar) *
                  </Label>
                  <Input
                    id="descriptionMyanmar"
                    value={formData.descriptionMyanmar}
                    onChange={(e) =>
                      handleInputChange("descriptionMyanmar", e.target.value)
                    }
                    placeholder="လစဉ် ဝင်ငွေခွန် ကောက်ခံမှု"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source (English) *</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) =>
                      handleInputChange("source", e.target.value)
                    }
                    placeholder="Yangon Regional Office"
                  />
                </div>
                <div>
                  <Label htmlFor="sourceMyanmar">Source (Myanmar) *</Label>
                  <Input
                    id="sourceMyanmar"
                    value={formData.sourceMyanmar}
                    onChange={(e) =>
                      handleInputChange("sourceMyanmar", e.target.value)
                    }
                    placeholder="ရန်ကုန်တိုင်း ရုံးချုပ်"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="receivedBy">Received By *</Label>
                  <Select
                    value={formData.receivedBy}
                    onValueChange={(value) =>
                      handleInputChange("receivedBy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {getEmployeeName(emp.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this income record..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingRecord ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default IncomeManagement;
