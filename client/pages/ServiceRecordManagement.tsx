import React, { useState, useEffect } from "react";
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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  FileText,
  Award,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import {
  useServiceRecord,
  usePersonnelServiceSummary,
} from "@/hooks/useServiceRecord";
import { ServiceRecord } from "@/types/government";
import { useToast } from "@/hooks/use-toast";

interface ServiceRecordManagementProps {
  personnelId?: string;
  showAllRecords?: boolean;
}

export const ServiceRecordManagement: React.FC<
  ServiceRecordManagementProps
> = ({ personnelId, showAllRecords = false }) => {
  const {
    serviceRecords,
    loading,
    createServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    approveServiceRecord,
    rejectServiceRecord,
    getRecordsByType,
    searchRecords,
  } = useServiceRecord(personnelId);
  const { summary: serviceSummary, loading: summaryLoading } =
    usePersonnelServiceSummary(personnelId || "");
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecord, setNewRecord] = useState<Partial<ServiceRecord>>({
    recordType: "appointment",
    title: "",
    titleMyanmar: "",
    description: "",
    descriptionMyanmar: "",
    effectiveDate: new Date(),
    orderNumber: "",
    issuedBy: "",
    approvedBy: "",
    status: "draft",
    urgency: "medium",
    remarks: "",
    remarksMyanmar: "",
    attachments: [],
  });

  const recordTypes = [
    {
      value: "appointment",
      label: "Appointment",
      labelMy: "ခန့်အပ်မှု",
      icon: FileText,
    },
    {
      value: "promotion",
      label: "Promotion",
      labelMy: "ရာထူးတိုးမြှင့်မှু",
      icon: ArrowRight,
    },
    {
      value: "transfer",
      label: "Transfer",
      labelMy: "နေရာပြောင်းမှု",
      icon: ArrowRight,
    },
    {
      value: "disciplinary",
      label: "Disciplinary",
      labelMy: "စည်းကမ်းခွဲခြင်း",
      icon: AlertTriangle,
    },
    {
      value: "training",
      label: "Training",
      labelMy: "လေ့ကျင့်မှု",
      icon: GraduationCap,
    },
    { value: "award", label: "Award", labelMy: "ဆုချီးမြှင့်မှု", icon: Award },
    { value: "leave", label: "Leave", labelMy: "လပ်ရက်", icon: Calendar },
    {
      value: "resignation",
      label: "Resignation",
      labelMy: "���ာထူးမှနုတ်ထွက်မှု",
      icon: FileText,
    },
  ];

  const getRecordIcon = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type);
    const IconComponent = recordType?.icon || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "promotion":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-yellow-100 text-yellow-800";
      case "disciplinary":
        return "bg-red-100 text-red-800";
      case "training":
        return "bg-purple-100 text-purple-800";
      case "award":
        return "bg-orange-100 text-orange-800";
      case "leave":
        return "bg-teal-100 text-teal-800";
      case "resignation":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getFilteredRecords = () => {
    let filtered = serviceRecords;

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (record) => record.recordType === selectedType,
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((record) => record.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = searchRecords(searchTerm);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.effectiveDate).getTime() -
        new Date(a.effectiveDate).getTime(),
    );
  };

  const handleCreateRecord = async () => {
    try {
      if (!personnelId && !newRecord.personnelId) {
        toast({
          title: "Validation Error",
          description: "Personnel ID is required",
          variant: "destructive",
        });
        return;
      }

      if (!newRecord.title || !newRecord.recordType) {
        toast({
          title: "Validation Error",
          description: "Title and Record Type are required",
          variant: "destructive",
        });
        return;
      }

      await createServiceRecord({
        ...newRecord,
        personnelId: personnelId || newRecord.personnelId!,
        createdBy: "current-user", // Replace with actual user
      } as Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">);

      toast({
        title: "Success",
        description: "Service record created successfully",
        variant: "default",
      });

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create service record",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecord = async () => {
    try {
      if (!editingRecord) return;

      await updateServiceRecord(editingRecord.id, newRecord);

      toast({
        title: "Success",
        description: "Service record updated successfully",
        variant: "default",
      });

      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update service record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (id: string, title: string) => {
    if (
      !confirm(`Are you sure you want to delete the service record "${title}"?`)
    ) {
      return;
    }

    try {
      await deleteServiceRecord(id);
      toast({
        title: "Success",
        description: "Service record deleted successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service record",
        variant: "destructive",
      });
    }
  };

  const handleApproveRecord = async (id: string) => {
    try {
      await approveServiceRecord(
        id,
        "current-user",
        "Approved via web interface",
      );
      toast({
        title: "Success",
        description: "Service record approved successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve service record",
        variant: "destructive",
      });
    }
  };

  const handleRejectRecord = async (id: string, reason: string) => {
    try {
      await rejectServiceRecord(id, "current-user", reason);
      toast({
        title: "Success",
        description: "Service record rejected",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject service record",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewRecord({
      recordType: "appointment",
      title: "",
      titleMyanmar: "",
      description: "",
      descriptionMyanmar: "",
      effectiveDate: new Date(),
      orderNumber: "",
      issuedBy: "",
      approvedBy: "",
      status: "draft",
      urgency: "medium",
      remarks: "",
      remarksMyanmar: "",
      attachments: [],
    });
  };

  const openEditDialog = (record: ServiceRecord) => {
    setEditingRecord(record);
    setNewRecord({
      recordType: record.recordType,
      title: record.title,
      titleMyanmar: record.titleMyanmar,
      description: record.description,
      descriptionMyanmar: record.descriptionMyanmar,
      effectiveDate: record.effectiveDate,
      endDate: record.endDate,
      fromPosition: record.fromPosition,
      toPosition: record.toPosition,
      fromDepartment: record.fromDepartment,
      toDepartment: record.toDepartment,
      fromLocation: record.fromLocation,
      toLocation: record.toLocation,
      orderNumber: record.orderNumber,
      issuedBy: record.issuedBy,
      approvedBy: record.approvedBy,
      status: record.status,
      urgency: record.urgency,
      remarks: record.remarks,
      remarksMyanmar: record.remarksMyanmar,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRecord(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredRecords = getFilteredRecords();

  if (loading && serviceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading service records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Record Management</h1>
          <h2 className="text-2xl font-bold text-red-600 mt-1">
            ဝန်ထမ်းမှတ်တမ်း စီမံခန့်ခွဲမှု
          </h2>
          <p className="text-gray-600 mt-2">
            Manage personnel service records and career history
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Service Summary Card */}
      {serviceSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Service Summary / ဝန်ထမ်းမှတ်တမ်း အနှစ်ချုပ်</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {serviceSummary.totalServiceYears}
                </div>
                <p className="text-sm text-gray-600">Years of Service</p>
                <p className="text-xs text-gray-500">နှစ်ပေါင်း</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {serviceSummary.transferHistory}
                </div>
                <p className="text-sm text-gray-600">Transfers</p>
                <p className="text-xs text-gray-500">နေရာပြောင်းမှု</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {serviceSummary.trainingsCompleted}
                </div>
                <p className="text-sm text-gray-600">Trainings</p>
                <p className="text-xs text-gray-500">လေ့ကျင့်မှု</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {serviceSummary.awards}
                </div>
                <p className="text-sm text-gray-600">Awards</p>
                <p className="text-xs text-gray-500">ဆုချီးမြှင့်မှု</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {serviceSummary.disciplinaryActions}
                </div>
                <p className="text-sm text-gray-600">Disciplinary</p>
                <p className="text-xs text-gray-500">စည်းကမ်းခွဲ</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  Grade {serviceSummary.currentGrade}
                </div>
                <p className="text-sm text-gray-600">Current Grade</p>
                <p className="text-xs text-gray-500">လက်ရှိအဆင့်</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {recordTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Records / ဝန်ထမ်းမှတ်တမ်းများ</CardTitle>
          <CardDescription>
            {filteredRecords.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded ${getRecordColor(record.recordType)}`}
                        >
                          {getRecordIcon(record.recordType)}
                        </div>
                        <span className="text-sm capitalize">
                          {record.recordType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.title}</div>
                        {record.titleMyanmar && (
                          <div className="text-sm text-gray-500">
                            {record.titleMyanmar}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(record.effectiveDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {record.orderNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          <span className="capitalize">{record.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          record.urgency === "urgent"
                            ? "border-red-200 text-red-700"
                            : record.urgency === "high"
                              ? "border-orange-200 text-orange-700"
                              : record.urgency === "medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-gray-200 text-gray-700"
                        }
                      >
                        {record.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(record)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {record.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRecord(record.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt(
                                  "Enter rejection reason:",
                                );
                                if (reason)
                                  handleRejectRecord(record.id, reason);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteRecord(record.id, record.title)
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
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No service records found</p>
              <Button
                onClick={openCreateDialog}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Service Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Service Record" : "Add New Service Record"}
            </DialogTitle>
            <DialogDescription>
              {editingRecord
                ? "Update the service record information"
                : "Create a new service record entry"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Record Type / မှတ်တမ်းအမျိုးအစား</Label>
                <Select
                  value={newRecord.recordType}
                  onValueChange={(value) =>
                    setNewRecord({
                      ...newRecord,
                      recordType: value as ServiceRecord["recordType"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recordTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {getRecordIcon(type.value)}
                          <span>
                            {type.label} / {type.labelMy}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Effective Date / အသက်ဝင်သည့်နေ့</Label>
                <Input
                  type="date"
                  value={
                    newRecord.effectiveDate
                      ? new Date(newRecord.effectiveDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      effectiveDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English)</Label>
                <Input
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                  placeholder="Enter record title"
                />
              </div>
              <div>
                <Label>Title (Myanmar) / ခေါင်းစဉ်</Label>
                <Input
                  value={newRecord.titleMyanmar}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, titleMyanmar: e.target.value })
                  }
                  placeholder="မြန်မာဘာသာ ခေါင်းစဉ် ရေးပါ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Description (Myanmar) / ဖော်ပြချက်</Label>
                <Textarea
                  value={newRecord.descriptionMyanmar}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      descriptionMyanmar: e.target.value,
                    })
                  }
                  placeholder="မြန်မာဘာသာ ဖော်ပြချက် ရေးပါ"
                  rows={3}
                />
              </div>
            </div>

            {/* Position/Department Changes (for transfers and promotions) */}
            {(newRecord.recordType === "transfer" ||
              newRecord.recordType === "promotion") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Position Changes / ရာထူးပြောင်းလဲမှု
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Position / မူလရာထူး</Label>
                      <Input
                        value={newRecord.fromPosition}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            fromPosition: e.target.value,
                          })
                        }
                        placeholder="Previous position"
                      />
                    </div>
                    <div>
                      <Label>To Position / အသစ်ရာထူး</Label>
                      <Input
                        value={newRecord.toPosition}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            toPosition: e.target.value,
                          })
                        }
                        placeholder="New position"
                      />
                    </div>
                    <div>
                      <Label>From Department / မူလဌာန</Label>
                      <Input
                        value={newRecord.fromDepartment}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            fromDepartment: e.target.value,
                          })
                        }
                        placeholder="Previous department"
                      />
                    </div>
                    <div>
                      <Label>To Department / အသစ်ဌာန</Label>
                      <Input
                        value={newRecord.toDepartment}
                        onChange={(e) =>
                          setNewRecord({
                            ...newRecord,
                            toDepartment: e.target.value,
                          })
                        }
                        placeholder="New department"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Administrative Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Order Number / အမိန့်နံပါတ်</Label>
                <Input
                  value={newRecord.orderNumber}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, orderNumber: e.target.value })
                  }
                  placeholder="e.g., ORDER-2024-001"
                />
              </div>
              <div>
                <Label>Issued By / အမိန့်ထုတ်သူ</Label>
                <Input
                  value={newRecord.issuedBy}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, issuedBy: e.target.value })
                  }
                  placeholder="Issuing authority"
                />
              </div>
              <div>
                <Label>Approved By / အတည်ပြုသူ</Label>
                <Input
                  value={newRecord.approvedBy}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, approvedBy: e.target.value })
                  }
                  placeholder="Approving authority"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status / အခြေအနေ</Label>
                <Select
                  value={newRecord.status}
                  onValueChange={(value) =>
                    setNewRecord({
                      ...newRecord,
                      status: value as ServiceRecord["status"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency / အရေးကြီးမှု</Label>
                <Select
                  value={newRecord.urgency}
                  onValueChange={(value) =>
                    setNewRecord({
                      ...newRecord,
                      urgency: value as ServiceRecord["urgency"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Remarks (English)</Label>
                <Textarea
                  value={newRecord.remarks}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, remarks: e.target.value })
                  }
                  placeholder="Additional remarks"
                  rows={3}
                />
              </div>
              <div>
                <Label>Remarks (Myanmar) / မှတ်ချက်</Label>
                <Textarea
                  value={newRecord.remarksMyanmar}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      remarksMyanmar: e.target.value,
                    })
                  }
                  placeholder="မြန်မာဘာသာ မှတ်ချက်"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingRecord ? handleUpdateRecord : handleCreateRecord}
            >
              {editingRecord ? "Update" : "Create"} Service Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRecordManagement;
