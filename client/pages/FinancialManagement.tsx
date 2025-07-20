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
  TrendingDown,
  PieChart,
  FileText,
  Download,
  Eye,
  Check,
  X,
  Settings,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  IncomeRecord,
  TransactionType,
  IncomeType,
  IncomeStatus,
  IncomeCategory,
  DEFAULT_INCOME_CATEGORIES,
  calculateBalance,
  groupTransactionsByType,
  formatCurrency,
  getIncomeTypeLabel,
  getIncomeStatusLabel,
  getTransactionTypeLabel,
  validateIncomeRecord,
} from "../../shared/income-system";

interface TransactionFormData {
  type: TransactionType;
  incomeType?: IncomeType;
  amount: number;
  currency: string;
  description: string;
  descriptionMyanmar: string;
  source?: string;
  sourceMyanmar?: string;
  outcomeCategory?: string; // For outcomes
  dateReceived: string;
  receivedBy: string;
  categoryId?: string; // For income with predefined categories
  status: IncomeStatus;
  documentUrl: string;
  notes: string;
}

const initialFormData: TransactionFormData = {
  type: "income",
  incomeType: "tax",
  amount: 0,
  currency: "MMK",
  description: "",
  descriptionMyanmar: "",
  source: "",
  sourceMyanmar: "",
  outcomeCategory: "",
  dateReceived: new Date().toISOString().split("T")[0],
  receivedBy: "",
  categoryId: "",
  status: "pending",
  documentUrl: "",
  notes: "",
};

export default function FinancialManagement() {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  // Mock data - would be replaced with API calls
  const [transactions, setTransactions] = useState<IncomeRecord[]>([]);
  const [categories] = useState<IncomeCategory[]>(
    DEFAULT_INCOME_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: `cat-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<IncomeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<IncomeRecord | null>(null);
  const [formData, setFormData] =
    useState<TransactionFormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncomeStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    return calculateBalance(transactions);
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.descriptionMyanmar
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction.source &&
          transaction.source.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const handleOpenDialog = (transaction?: IncomeRecord) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        incomeType: transaction.incomeType,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        descriptionMyanmar: transaction.descriptionMyanmar,
        source: transaction.source || "",
        sourceMyanmar: transaction.sourceMyanmar || "",
        outcomeCategory: transaction.outcomeCategory || "",
        dateReceived: transaction.dateReceived.split("T")[0],
        receivedBy: transaction.receivedBy,
        categoryId: transaction.category?.id || "",
        status: transaction.status,
        documentUrl: transaction.documentUrl || "",
        notes: transaction.notes || "",
      });
    } else {
      setEditingTransaction(null);
      setFormData(initialFormData);
    }
    setErrors([]);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Basic validation
    const validationErrors = [];
    if (!formData.amount || formData.amount <= 0) {
      validationErrors.push("Amount must be greater than 0");
    }
    if (!formData.description.trim()) {
      validationErrors.push("Description is required");
    }
    if (formData.type === "income" && !formData.source?.trim()) {
      validationErrors.push("Income source is required");
    }
    if (formData.type === "outcome" && !formData.outcomeCategory?.trim()) {
      validationErrors.push("Outcome category is required");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const now = new Date().toISOString();
    const selectedCategory = categories.find(
      (cat) => cat.id === formData.categoryId,
    );

    if (editingTransaction) {
      // Update existing transaction
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction.id
            ? {
                ...transaction,
                type: formData.type,
                incomeType: formData.incomeType,
                amount: formData.amount,
                currency: formData.currency,
                description: formData.description,
                descriptionMyanmar: formData.descriptionMyanmar,
                source: formData.source,
                sourceMyanmar: formData.sourceMyanmar,
                outcomeCategory: formData.outcomeCategory,
                dateReceived: formData.dateReceived,
                receivedBy: formData.receivedBy,
                category: selectedCategory,
                status: formData.status,
                documentUrl: formData.documentUrl,
                notes: formData.notes,
                updatedAt: now,
              }
            : transaction,
        ),
      );
    } else {
      // Add new transaction
      const newTransaction: IncomeRecord = {
        id: `trans-${Date.now()}`,
        type: formData.type,
        incomeType: formData.incomeType,
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        descriptionMyanmar: formData.descriptionMyanmar,
        source: formData.source,
        sourceMyanmar: formData.sourceMyanmar,
        outcomeCategory: formData.outcomeCategory,
        dateReceived: formData.dateReceived,
        receivedBy: formData.receivedBy,
        category: selectedCategory,
        status: formData.status,
        documentUrl: formData.documentUrl,
        notes: formData.notes,
        createdAt: now,
        updatedAt: now,
      };
      setTransactions((prev) => [...prev, newTransaction]);
    }

    setIsDialogOpen(false);
    setEditingTransaction(null);
    setErrors([]);
  };

  const handleDelete = () => {
    if (transactionToDelete) {
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== transactionToDelete.id),
      );
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const getStatusBadgeColor = (status: IncomeStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: TransactionType) => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  const activeTaxCategories = categories.filter(
    (cat) => cat.incomeType === "tax" && cat.isActive,
  );
  const activeDonationCategories = categories.filter(
    (cat) => cat.incomeType === "donation" && cat.isActive,
  );

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Financial Management
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  Manage income and expenses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/income-category-settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialSummary.totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Outcomes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialSummary.totalOutcomes)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p
                    className={`text-2xl font-bold ${
                      financialSummary.balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(financialSummary.balance)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-myanmar-black">
                    {transactions.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-myanmar-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-myanmar-red/20 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as TransactionType | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="outcome">Outcome</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as IncomeStatus | "all")
                }
              >
                <SelectTrigger>
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

              <Button
                variant="outline"
                className="border-myanmar-red text-myanmar-red"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-myanmar-red/20">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category/Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge
                          className={
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {getTransactionTypeLabel(
                            transaction.type,
                            currentLanguage as "en" | "mm",
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.descriptionMyanmar}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.type === "income" ? (
                          <div>
                            <p className="text-sm">
                              {transaction.category?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.source}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">
                            {transaction.expenseCategory}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className={getTypeColor(transaction.type)}>
                        <span className="font-medium">
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(transaction.status)}
                        >
                          {getIncomeStatusLabel(
                            transaction.status,
                            currentLanguage as "en" | "mm",
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          transaction.dateReceived,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(transaction)}
                            className="border-myanmar-red text-myanmar-red"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTransactionToDelete(transaction);
                              setDeleteDialogOpen(true);
                            }}
                            className="border-red-500 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
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

            {/* Transaction Type */}
            <div>
              <Label>Transaction Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as TransactionType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income (ဝင်ငွေ)</SelectItem>
                  <SelectItem value="expense">Expense (သုံးငွေ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Income Type (only for income) */}
            {formData.type === "income" && (
              <div>
                <Label>Income Type *</Label>
                <Select
                  value={formData.incomeType || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      incomeType: value as IncomeType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax">
                      Tax Income (အခွန်ဝင်ငွေ)
                    </SelectItem>
                    <SelectItem value="donation">Donation (အလှူငွေ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMK">MMK</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English) *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label>Description (Myanmar)</Label>
                <Input
                  value={formData.descriptionMyanmar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriptionMyanmar: e.target.value,
                    })
                  }
                  placeholder="ဖော်ပြချက်"
                />
              </div>
            </div>

            {formData.type === "income" ? (
              <>
                {/* Category for Income */}
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.incomeType === "tax" &&
                        activeTaxCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.nameMyanmar})
                          </SelectItem>
                        ))}
                      {formData.incomeType === "donation" &&
                        activeDonationCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.nameMyanmar})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source for Income */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source (English) *</Label>
                    <Input
                      value={formData.source || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                      placeholder="Income source"
                    />
                  </div>
                  <div>
                    <Label>Source (Myanmar)</Label>
                    <Input
                      value={formData.sourceMyanmar || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sourceMyanmar: e.target.value,
                        })
                      }
                      placeholder="ရင်းမြစ်"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Expense Category (free text) */}
                <div>
                  <Label>Expense Category *</Label>
                  <Input
                    value={formData.expenseCategory || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expenseCategory: e.target.value,
                      })
                    }
                    placeholder="What was this expense for? (e.g., Office supplies, Utilities, etc.)"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.dateReceived}
                  onChange={(e) =>
                    setFormData({ ...formData, dateReceived: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Received/Recorded By *</Label>
                <Input
                  value={formData.receivedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, receivedBy: e.target.value })
                  }
                  placeholder="Person responsible"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as IncomeStatus })
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

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-myanmar-red hover:bg-myanmar-red-dark"
              >
                {editingTransaction ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
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
