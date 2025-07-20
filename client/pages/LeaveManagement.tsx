import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { translations } from "@shared/translations";
import {
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  DEFAULT_LEAVE_TYPES,
} from "@shared/hr-system";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
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
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plane,
  Heart,
  Stethoscope,
  Users,
  TrendingUp,
  Upload,
  Eye,
} from "lucide-react";

interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  avgLeaveDays: number;
  mostUsedLeaveType: string;
}

export default function LeaveManagement() {
  const { state } = useApp();
  const [selectedTab, setSelectedTab] = useState("requests");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Form state for new leave request
  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    documents: [] as File[],
  });

  // Mock leave requests data
  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: "leave001",
      employeeId: "P14034",
      leaveType: {
        id: "annual",
        name: "Annual Leave",
        nameMyanmar: "နှစ်ပတ်လပ်ရက်",
        maxDaysPerYear: 21,
        maxConsecutiveDays: 14,
        requiresDocuments: false,
        requiresApproval: true,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        isActive: true,
      },
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      totalDays: 5,
      reason: "ကိုယ်ရေးကိုယ်တာ အကြောင်းများ",
      status: "pending",
      appliedDate: "2024-01-15",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T09:00:00Z",
    },
    // Add more mock data as needed
  ];

  // Mock leave balances
  const mockLeaveBalances: LeaveBalance[] = [
    {
      id: "balance001",
      employeeId: "P14034",
      year: 2024,
      leaveType: {
        id: "annual",
        name: "Annual Leave",
        nameMyanmar: "နှစ်ပတ်လပ်ရက်",
        maxDaysPerYear: 21,
        maxConsecutiveDays: 14,
        requiresDocuments: false,
        requiresApproval: true,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        isActive: true,
      },
      totalAllowance: 21,
      used: 8,
      pending: 5,
      remaining: 8,
      carriedForward: 3,
      updatedAt: "2024-01-15T09:00:00Z",
    },
    // Add more mock data
  ];

  const leaveStats = useMemo((): LeaveStats => {
    return {
      totalRequests: mockLeaveRequests.length * 8, // Simulated
      pendingRequests: 12,
      approvedThisMonth: 25,
      rejectedThisMonth: 3,
      avgLeaveDays: 4.2,
      mostUsedLeaveType: "နှစ်ပတ်လপ်ရက်",
    };
  }, []);

  const handleCreateLeaveRequest = () => {
    if (
      !leaveForm.employeeId ||
      !leaveForm.leaveType ||
      !startDate ||
      !endDate
    ) {
      return;
    }

    const totalDays = differenceInDays(endDate, startDate) + 1;

    const newRequest: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt"> = {
      employeeId: leaveForm.employeeId,
      leaveType: DEFAULT_LEAVE_TYPES.find(
        (lt) => lt.nameMyanmar === leaveForm.leaveType,
      ) as LeaveType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays,
      reason: leaveForm.reason,
      status: "pending",
      appliedDate: new Date().toISOString(),
    };

    // Here you would call API to create the leave request
    console.log("Creating leave request:", newRequest);

    // Reset form and close dialog
    setLeaveForm({
      employeeId: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      documents: [],
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setIsCreateDialogOpen(false);
  };

  const handleApproveLeave = (requestId: string) => {
    console.log("Approving leave request:", requestId);
  };

  const handleRejectLeave = (requestId: string) => {
    console.log("Rejecting leave request:", requestId);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: "စောင့်ဆိုင်းနေ",
        color: "bg-yellow-100 text-yellow-800",
      },
      approved: { label: "အတည်ပြုပြီး", color: "bg-green-100 text-green-800" },
      rejected: { label: "ငြင်းပ��်ပြီး", color: "bg-red-100 text-red-800" },
      cancelled: { label: "ပယ်ဖျက်ပြီး", color: "bg-gray-100 text-gray-800" },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getLeaveTypeIcon = (leaveTypeName: string) => {
    if (leaveTypeName.includes("နှစ်ပတ်")) return <Plane className="w-4 h-4" />;
    if (leaveTypeName.includes("ဖျား"))
      return <Stethoscope className="w-4 h-4" />;
    if (leaveTypeName.includes("မီးဖွား")) return <Heart className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/hr-dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  နောက်သို့
                </Button>
              </Link>
              <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
                <CalendarIcon className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  လပ်ရက်စီမံခန့်ခွဲမှု
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  ဝန်ထမ်းများ၏ လပ်ရက်အခွင့်အရေး နှင့် အတည်ပြုမှုစနစ်
                </p>
              </div>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-myanmar-red hover:bg-myanmar-red-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  လပ်ရက်တောင်းရန်
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>လပ်ရက်အသစ် တောင်းခံရန်</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ဝန်ထမ်း</Label>
                      <Select
                        value={leaveForm.employeeId}
                        onValueChange={(value) =>
                          setLeaveForm({ ...leaveForm, employeeId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ဝန်ထမ်းရွေးချယ်ရန်" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.personnel
                            .filter((p) => p.status === "active")
                            .map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.name} ({person.id})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>လပ်ရက်အမျိုးအစား</Label>
                      <Select
                        value={leaveForm.leaveType}
                        onValueChange={(value) =>
                          setLeaveForm({ ...leaveForm, leaveType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="လပ်ရက်အမျိုးအစားရွေးရန်" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_LEAVE_TYPES.map((type) => (
                            <SelectItem
                              key={type.name}
                              value={type.nameMyanmar}
                            >
                              <div className="flex items-center space-x-2">
                                {getLeaveTypeIcon(type.nameMyanmar)}
                                <span>{type.nameMyanmar}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>စတင်သည့်ရက်</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate
                              ? format(startDate, "dd/MM/yyyy")
                              : "ရက်စွဲရွေးရန်"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>ပြီးဆုံးသ��့်ရက်</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate
                              ? format(endDate, "dd/MM/yyyy")
                              : "ရက်စွဲရွေးရန်"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) =>
                              startDate ? date < startDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        စုစုပေါင်း လပ်ရက်:{" "}
                        <strong>
                          {differenceInDays(endDate, startDate) + 1} ရက်
                        </strong>
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>အကြောင်းရင်း</Label>
                    <Textarea
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                      placeholder="လပ်ရက်တောင်းခံရခြင်း အကြောင်းရင်းကို ဖော်ပြပါ..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>ပထောက်ခံစာရွက်များ (အကယ်၍ရှိလျှင်)</Label>
                    <div className="border-2 border-dashed border-myanmar-red/30 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-myanmar-gray-dark mx-auto mb-2" />
                      <p className="text-sm text-myanmar-gray-dark">
                        ဖိုင်များကို ဤနေရာတွင် ဖိဆွဲထည့်ပါ သို့မဟုတ် နှိပ်၍
                        ရွေးချယ်ပါ
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        ဖိုင်ရွေးချယ်ရန်
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      ပယ်ဖျက်ရန်
                    </Button>
                    <Button
                      onClick={handleCreateLeaveRequest}
                      className="bg-myanmar-red hover:bg-myanmar-red-dark"
                    >
                      တောင်းခံရန်
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    စုစုပေါင်း တောင်းခံမှုများ
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {leaveStats.totalRequests}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% ယခုလ
                  </p>
                </div>
                <FileText className="w-12 h-12 text-myanmar-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    အတည်ပြုစောင့်ဆိုင်းနေ
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {leaveStats.pendingRequests}
                  </p>
                  <p className="text-sm text-yellow-600">အရေးပေါ် လုပ်ရန်</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    ယခုလ အတည်ပြုပြီး
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {leaveStats.approvedThisMonth}
                  </p>
                  <p className="text-sm text-myanmar-gray-dark">
                    ငြင်းပယ်: {leaveStats.rejectedThisMonth}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    ပျမ်းမျှ လပ်ရက်
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {leaveStats.avgLeaveDays}
                  </p>
                  <p className="text-sm text-myanmar-gray-dark">
                    ရက် / တောင်းခံမှု
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Management Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="requests">တောင်းခံမှုများ</TabsTrigger>
            <TabsTrigger value="balances">လပ်ရက်ကျန်</TabsTrigger>
            <TabsTrigger value="calendar">ပြက္ခဒိန်</TabsTrigger>
            <TabsTrigger value="reports">အစီရင်ခံစာများ</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card className="border-myanmar-red/20">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label>ဝန်ထမ်းရှာဖွေရန်</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myanmar-gray-dark w-4 h-4" />
                      <Input
                        placeholder="အမည် သို့မဟုတ် ID ဖြင့် ရှာရန်..."
                        className="pl-10 border-myanmar-red/30"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>အခြေအနေ</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-40 border-myanmar-red/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">အားလုံး</SelectItem>
                        <SelectItem value="pending">စောင့်ဆိုင်းနေ</SelectItem>
                        <SelectItem value="approved">အတည်ပြုပြီး</SelectItem>
                        <SelectItem value="rejected">ငြင်းပယ်ပြီး</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="bg-myanmar-red hover:bg-myanmar-red-dark">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leave Requests Table */}
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">လပ်ရက်တောင်းခံမှုများ</h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ဝန်ထမ်း</TableHead>
                      <TableHead>လပ်ရက်အမျိုးအစား</TableHead>
                      <TableHead>ရက်စွဲများ</TableHead>
                      <TableHead>ရက်ပေါင်း</TableHead>
                      <TableHead>အကြောင်းရင်း</TableHead>
                      <TableHead>အခြေအနေ</TableHead>
                      <TableHead>လုပ်ဆောင်ချက်များ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.personnel
                      .filter((p) => p.status === "active")
                      .slice(0, 5)
                      .map((person, index) => (
                        <TableRow key={person.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{person.name}</p>
                              <p className="text-sm text-myanmar-gray-dark">
                                {person.id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getLeaveTypeIcon("နှစ်ပတ်")}
                              <span>နှစ်ပတ်လပ်ရက်</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">20/01/2024</p>
                              <p className="text-sm text-myanmar-gray-dark">
                                သို့ 25/01/2024
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              5 ရက်
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">
                              ကိုယ်ရေးကိုယ်တာ အကြောင်းများ
                            </p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              index === 0
                                ? "pending"
                                : index === 1
                                  ? "approved"
                                  : "pending",
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {index === 0 && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproveLeave(`leave00${index}`)
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRejectLeave(`leave00${index}`)
                                    }
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-myanmar-red text-myanmar-red"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_LEAVE_TYPES.filter((type) => type.isActive).map(
                (leaveType) => (
                  <Card key={leaveType.name} className="border-myanmar-red/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center space-x-2">
                          {getLeaveTypeIcon(leaveType.nameMyanmar)}
                          <span>{leaveType.nameMyanmar}</span>
                        </h3>
                        <Badge className="bg-myanmar-red text-white">
                          {leaveType.maxDaysPerYear}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>စုစုပေါင်း ခွင့်ပြုချက်:</span>
                          <span className="font-medium">
                            {leaveType.maxDaysPerYear} ရက်
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>အသုံးပြုပြီး:</span>
                          <span className="font-medium text-red-600">
                            {Math.round(leaveType.maxDaysPerYear * 0.3)} ရက်
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>စောင့်ဆိုင်းနေ:</span>
                          <span className="font-medium text-yellow-600">
                            {Math.round(leaveType.maxDaysPerYear * 0.1)} ရက်
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ကျန်ရှိနေ:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(leaveType.maxDaysPerYear * 0.6)} ရက်
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-myanmar-red h-2 rounded-full"
                            style={{
                              width: `${(1 - 0.6) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">လပ်ရက်ပြက္ခဒိန်</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <Calendar
                      mode="single"
                      className="rounded-md border border-myanmar-red/20"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">ယနေ့ လပ်ရက်ရှိသူများ</h4>
                      <div className="space-y-2">
                        {state.personnel.slice(0, 3).map((person) => (
                          <div
                            key={person.id}
                            className="flex items-center space-x-2 p-2 bg-red-50 rounded"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">
                                {person.name}
                              </p>
                              <p className="text-xs text-myanmar-gray-dark">
                                နှစ်ပတ်လပ်ရက်
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">လာမည့်အပတ်</h4>
                      <div className="space-y-2">
                        {state.personnel.slice(3, 5).map((person) => (
                          <div
                            key={person.id}
                            className="flex items-center space-x-2 p-2 bg-blue-50 rounded"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium">
                                {person.name}
                              </p>
                              <p className="text-xs text-myanmar-gray-dark">
                                ဖျားနာလပ်ရက်
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <FileText className="w-8 h-8 text-myanmar-red" />
                  <h3 className="font-semibold">လစဉ် လပ်ရက်အစီရင်ခံစာ</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-myanmar-gray-dark mb-4">
                    လစဉ် လပ်ရက်အသုံးပြုမှု နှင့် ခွဲခြမ်းစိတ်ဖြာမှု
                  </p>
                  <Button className="w-full bg-myanmar-red hover:bg-myanmar-red-dark">
                    <Download className="w-4 h-4 mr-2" />
                    လစဉ် အစီရင်ခံစာ
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <Users className="w-8 h-8 text-myanmar-red" />
                  <h3 className="font-semibold">ဝန်ထမ်းအလိုက် အစီရင်ခံစာ</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-myanmar-gray-dark mb-4">
                    တစ်ဦးချင်း ဝန်ထမ်း လပ်ရက်အသုံးပြုမှု
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-myanmar-red text-myanmar-red"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    တစ်ဦးချင်း အစီရင်ခံစာ
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <CalendarIcon className="w-8 h-8 text-myanmar-red" />
                  <h3 className="font-semibold">နှစ်ပတ်လပ်ရက် အစီရင်ခံစာ</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-myanmar-gray-dark mb-4">
                    နှစ်စဉ် လပ်ရက်ခွင့်များ ခွဲခြမ်းစိတ်ဖြာမှု
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-myanmar-red text-myanmar-red"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    နှစ်ပတ် အစီရင်ခံစာ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
