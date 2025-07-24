import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Settings,
} from "lucide-react";
import { useGovernmentLeave } from "@/hooks/useGovernmentLeave";
import { GovernmentLeavePolicy } from "@/types/government";
import { useToast } from "@/hooks/use-toast";

export const GovernmentLeavePolicyManagement: React.FC = () => {
  const {
    leavePolicies,
    loading,
    createLeavePolicy,
    updateLeavePolicy,
    deleteLeavePolicy,
    validateLeaveRequest,
    calculateLeavePay,
    generateDefaultLeavePolicies,
    exportLeavePolicies,
  } = useGovernmentLeave();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] =
    useState<GovernmentLeavePolicy | null>(null);
  const [selectedTab, setSelectedTab] = useState("policies");
  const [newPolicy, setNewPolicy] = useState<Partial<GovernmentLeavePolicy>>({
    leaveType: "",
    leaveTypeMyanmar: "",
    leaveCode: "",
    entitlementPerYear: 0,
    maxCarryForward: 0,
    canCarryForward: false,
    requiresMedicalCertificate: false,
    requiresApproval: true,
    maxConsecutiveDays: 0,
    minAdvanceNotice: 0,
    minimumServiceRequired: 0,
    applicableGrades: [],
    applicableGenders: ["both"],
    approvalLevels: [],
    salaryPercentage: 100,
    includeWeekends: false,
    includeHolidays: false,
    description: "",
    descriptionMyanmar: "",
    eligibilityRules: "",
    eligibilityRulesMyanmar: "",
    isActive: true,
    effectiveDate: new Date(),
    createdBy: "admin",
    approvedBy: "",
  });

  // Validation form
  const [validationForm, setValidationForm] = useState({
    leaveType: "",
    duration: 0,
    grade: 1,
    gender: "male" as "male" | "female",
    serviceMonths: 0,
    baseSalary: 0,
  });

  const handleCreatePolicy = async () => {
    try {
      if (
        !newPolicy.leaveType ||
        !newPolicy.leaveCode ||
        !newPolicy.entitlementPerYear
      ) {
        toast({
          title: "Validation Error",
          description: "Leave Type, Code, and Annual Entitlement are required",
          variant: "destructive",
        });
        return;
      }

      await createLeavePolicy(
        newPolicy as Omit<
          GovernmentLeavePolicy,
          "id" | "createdAt" | "updatedAt"
        >,
      );

      toast({
        title: "Success",
        description: "Leave policy created successfully",
        variant: "default",
      });

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create leave policy",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      if (!editingPolicy) return;

      await updateLeavePolicy(editingPolicy.id, newPolicy);

      toast({
        title: "Success",
        description: "Leave policy updated successfully",
        variant: "default",
      });

      setIsDialogOpen(false);
      setEditingPolicy(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave policy",
        variant: "destructive",
      });
    }
  };

  const handleDeletePolicy = async (id: string, leaveType: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${leaveType}" leave policy?`,
      )
    ) {
      return;
    }

    try {
      await deleteLeavePolicy(id);
      toast({
        title: "Success",
        description: "Leave policy deleted successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete leave policy",
        variant: "destructive",
      });
    }
  };

  const handleGenerateDefaults = async () => {
    if (
      !confirm(
        "This will create default Myanmar government leave policies. Continue?",
      )
    ) {
      return;
    }

    try {
      await generateDefaultLeavePolicies();
      toast({
        title: "Success",
        description: "Default leave policies generated successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate default policies",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      const csvContent = exportLeavePolicies();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "government_leave_policies.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Leave policies exported successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export leave policies",
        variant: "destructive",
      });
    }
  };

  const handleValidateLeave = () => {
    const { leaveType, duration, grade, gender, serviceMonths } =
      validationForm;

    if (!leaveType || !duration) {
      toast({
        title: "Validation Error",
        description: "Leave type and duration are required",
        variant: "destructive",
      });
      return;
    }

    const validation = validateLeaveRequest(
      leaveType,
      duration,
      grade,
      gender,
      serviceMonths,
    );

    if (validation.isValid) {
      const payCalculation = calculateLeavePay(
        leaveType,
        duration,
        validationForm.baseSalary,
      );

      toast({
        title: "Validation Result",
        description: `✅ Leave request is valid. Pay: ${payCalculation.totalPay.toLocaleString()} MMK (${payCalculation.payPercentage}%)`,
        variant: "default",
      });
    } else {
      toast({
        title: "Validation Failed",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewPolicy({
      leaveType: "",
      leaveTypeMyanmar: "",
      leaveCode: "",
      entitlementPerYear: 0,
      maxCarryForward: 0,
      canCarryForward: false,
      requiresMedicalCertificate: false,
      requiresApproval: true,
      maxConsecutiveDays: 0,
      minAdvanceNotice: 0,
      minimumServiceRequired: 0,
      applicableGrades: [],
      applicableGenders: ["both"],
      approvalLevels: [],
      salaryPercentage: 100,
      includeWeekends: false,
      includeHolidays: false,
      description: "",
      descriptionMyanmar: "",
      eligibilityRules: "",
      eligibilityRulesMyanmar: "",
      isActive: true,
      effectiveDate: new Date(),
      createdBy: "admin",
      approvedBy: "",
    });
  };

  const openEditDialog = (policy: GovernmentLeavePolicy) => {
    setEditingPolicy(policy);
    setNewPolicy({
      leaveType: policy.leaveType,
      leaveTypeMyanmar: policy.leaveTypeMyanmar,
      leaveCode: policy.leaveCode,
      entitlementPerYear: policy.entitlementPerYear,
      maxCarryForward: policy.maxCarryForward,
      canCarryForward: policy.canCarryForward,
      requiresMedicalCertificate: policy.requiresMedicalCertificate,
      requiresApproval: policy.requiresApproval,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      minAdvanceNotice: policy.minAdvanceNotice,
      minimumServiceRequired: policy.minimumServiceRequired,
      applicableGrades: policy.applicableGrades,
      applicableGenders: policy.applicableGenders,
      approvalLevels: policy.approvalLevels,
      salaryPercentage: policy.salaryPercentage,
      includeWeekends: policy.includeWeekends,
      includeHolidays: policy.includeHolidays,
      description: policy.description,
      descriptionMyanmar: policy.descriptionMyanmar,
      eligibilityRules: policy.eligibilityRules,
      eligibilityRulesMyanmar: policy.eligibilityRulesMyanmar,
      isActive: policy.isActive,
      effectiveDate: policy.effectiveDate,
      createdBy: policy.createdBy,
      approvedBy: policy.approvedBy,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPolicy(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading && leavePolicies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading leave policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Government Leave Policy Management
          </h1>
          <h2 className="text-2xl font-bold text-red-600 mt-1">
            အစိုးရ လပ်ရက်မူဝါဒ စီမံခန့်ခွဲမှု
          </h2>
          <p className="text-gray-600 mt-2">
            Manage government employee leave policies and entitlements
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateDefaults} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Generate Defaults
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>

      {leavePolicies.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Leave Policies Found</AlertTitle>
          <AlertDescription>
            No government leave policies have been configured yet. Click
            "Generate Defaults" to create standard Myanmar government leave
            policies.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="policies">
            Leave Policies ({leavePolicies.length})
          </TabsTrigger>
          <TabsTrigger value="validator">Leave Validator</TabsTrigger>
          <TabsTrigger value="calculator">Pay Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>
                Government Leave Policies / အစိုးရ လပ်ရက်မူဝါဒများ
              </CardTitle>
              <CardDescription>
                Manage different types of leave policies for government
                employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leavePolicies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Annual Entitlement</TableHead>
                      <TableHead>Max Consecutive</TableHead>
                      <TableHead>Min Service</TableHead>
                      <TableHead>Salary %</TableHead>
                      <TableHead>Medical Cert</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leavePolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {policy.leaveType}
                            </div>
                            <div className="text-sm text-gray-500">
                              {policy.leaveTypeMyanmar}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{policy.leaveCode}</Badge>
                        </TableCell>
                        <TableCell>{policy.entitlementPerYear} days</TableCell>
                        <TableCell>{policy.maxConsecutiveDays} days</TableCell>
                        <TableCell>
                          {policy.minimumServiceRequired} months
                        </TableCell>
                        <TableCell>{policy.salaryPercentage}%</TableCell>
                        <TableCell>
                          {policy.requiresMedicalCertificate ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={policy.isActive ? "default" : "secondary"}
                          >
                            {policy.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(policy)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeletePolicy(policy.id, policy.leaveType)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No leave policies found</p>
                  <Button
                    onClick={openCreateDialog}
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Leave Policy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validator">
          <Card>
            <CardHeader>
              <CardTitle>
                Leave Request Validator / လပ်ရက်တောင်းခံစာ စစ်ဆေးကိရိယာ
              </CardTitle>
              <CardDescription>
                Validate leave requests against government policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Leave Type</Label>
                  <Select
                    value={validationForm.leaveType}
                    onValueChange={(value) =>
                      setValidationForm({ ...validationForm, leaveType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leavePolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.leaveType}>
                          {policy.leaveType} / {policy.leaveTypeMyanmar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={validationForm.duration}
                    onChange={(e) =>
                      setValidationForm({
                        ...validationForm,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Number of days"
                  />
                </div>
                <div>
                  <Label>Employee Grade</Label>
                  <Select
                    value={validationForm.grade.toString()}
                    onValueChange={(value) =>
                      setValidationForm({
                        ...validationForm,
                        grade: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={validationForm.gender}
                    onValueChange={(value) =>
                      setValidationForm({
                        ...validationForm,
                        gender: value as "male" | "female",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service Months</Label>
                  <Input
                    type="number"
                    value={validationForm.serviceMonths}
                    onChange={(e) =>
                      setValidationForm({
                        ...validationForm,
                        serviceMonths: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Months of service"
                  />
                </div>
                <div>
                  <Label>Base Salary (MMK)</Label>
                  <Input
                    type="number"
                    value={validationForm.baseSalary}
                    onChange={(e) =>
                      setValidationForm({
                        ...validationForm,
                        baseSalary: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Monthly salary"
                  />
                </div>
              </div>

              <Button onClick={handleValidateLeave} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Validate Leave Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>
                Leave Pay Calculator / လပ်ရက်လစာ တွက်ချက်ကိရိယာ
              </CardTitle>
              <CardDescription>
                Calculate leave pay based on government policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Leave pay calculator will be displayed here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Use the validator tab to see pay calculations for specific
                  leave requests
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy
                ? `Edit the ${editingPolicy.leaveType} leave policy`
                : "Create a new government leave policy"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Leave Type (English)</Label>
                <Input
                  value={newPolicy.leaveType}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, leaveType: e.target.value })
                  }
                  placeholder="e.g., Annual Leave"
                />
              </div>
              <div>
                <Label>Leave Type (Myanmar)</Label>
                <Input
                  value={newPolicy.leaveTypeMyanmar}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      leaveTypeMyanmar: e.target.value,
                    })
                  }
                  placeholder="e.g., နှစ်ပတ်လပ်ရက်"
                />
              </div>
              <div>
                <Label>Leave Code</Label>
                <Input
                  value={newPolicy.leaveCode}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      leaveCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., AL"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Entitlements */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Annual Entitlement (days)</Label>
                <Input
                  type="number"
                  value={newPolicy.entitlementPerYear}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      entitlementPerYear: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Max Consecutive Days</Label>
                <Input
                  type="number"
                  value={newPolicy.maxConsecutiveDays}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      maxConsecutiveDays: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Min Advance Notice (days)</Label>
                <Input
                  type="number"
                  value={newPolicy.minAdvanceNotice}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      minAdvanceNotice: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Min Service Required (months)</Label>
                <Input
                  type="number"
                  value={newPolicy.minimumServiceRequired}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      minimumServiceRequired: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Pay and Carry Forward */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Salary Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newPolicy.salaryPercentage}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      salaryPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Max Carry Forward (days)</Label>
                <Input
                  type="number"
                  value={newPolicy.maxCarryForward}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      maxCarryForward: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="canCarryForward"
                  checked={newPolicy.canCarryForward}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, canCarryForward: !!checked })
                  }
                />
                <Label htmlFor="canCarryForward">Can Carry Forward</Label>
              </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresMedicalCertificate"
                  checked={newPolicy.requiresMedicalCertificate}
                  onCheckedChange={(checked) =>
                    setNewPolicy({
                      ...newPolicy,
                      requiresMedicalCertificate: !!checked,
                    })
                  }
                />
                <Label htmlFor="requiresMedicalCertificate">
                  Requires Medical Certificate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={newPolicy.requiresApproval}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, requiresApproval: !!checked })
                  }
                />
                <Label htmlFor="requiresApproval">Requires Approval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeWeekends"
                  checked={newPolicy.includeWeekends}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, includeWeekends: !!checked })
                  }
                />
                <Label htmlFor="includeWeekends">Include Weekends</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHolidays"
                  checked={newPolicy.includeHolidays}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, includeHolidays: !!checked })
                  }
                />
                <Label htmlFor="includeHolidays">Include Holidays</Label>
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, description: e.target.value })
                  }
                  placeholder="Description of the leave policy"
                  rows={3}
                />
              </div>
              <div>
                <Label>Description (Myanmar)</Label>
                <Textarea
                  value={newPolicy.descriptionMyanmar}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      descriptionMyanmar: e.target.value,
                    })
                  }
                  placeholder="လပ်ရက်မူဝါဒ ဖော်ပြချက်"
                  rows={3}
                />
              </div>
            </div>

            {/* Eligibility Rules */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Eligibility Rules (English)</Label>
                <Textarea
                  value={newPolicy.eligibilityRules}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      eligibilityRules: e.target.value,
                    })
                  }
                  placeholder="Rules for eligibility"
                  rows={3}
                />
              </div>
              <div>
                <Label>Eligibility Rules (Myanmar)</Label>
                <Textarea
                  value={newPolicy.eligibilityRulesMyanmar}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      eligibilityRulesMyanmar: e.target.value,
                    })
                  }
                  placeholder="အရည်အချင်း စည်းမျဉ်းများ"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={
                  newPolicy.effectiveDate
                    ? new Date(newPolicy.effectiveDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setNewPolicy({
                    ...newPolicy,
                    effectiveDate: new Date(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingPolicy ? handleUpdatePolicy : handleCreatePolicy}
            >
              {editingPolicy ? "Update" : "Create"} Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernmentLeavePolicyManagement;
