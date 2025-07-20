import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { translations } from "@shared/translations";
import { AttendanceRecord, AttendanceSettings } from "@shared/hr-system";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { format } from "date-fns";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Coffee,
  MapPin,
  FileText,
  Download,
  Filter,
  Search,
  ArrowLeft,
  Play,
  Pause,
  Square,
  BarChart3,
  Timer,
  UserCheck,
} from "lucide-react";

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageWorkHours: number;
  overtimeHours: number;
  attendanceRate: number;
}

export default function AttendanceSystem() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");

  // Mock attendance data - in real app this would come from API
  const mockAttendanceData: AttendanceRecord[] = [
    {
      id: "att001",
      employeeId: "P14034",
      date: "2024-01-15",
      checkIn: "2024-01-15T08:30:00Z",
      checkOut: "2024-01-15T17:45:00Z",
      breakStart: "2024-01-15T12:00:00Z",
      breakEnd: "2024-01-15T13:00:00Z",
      totalHours: 8.25,
      overtimeHours: 0.75,
      status: "present",
      location: "Main Office",
      createdAt: "2024-01-15T08:30:00Z",
      updatedAt: "2024-01-15T17:45:00Z",
    },
    // Add more mock data as needed
  ];

  const attendanceStats = useMemo((): AttendanceStats => {
    const totalEmployees = state.personnel.filter(
      (p) => p.status === "active",
    ).length;
    const presentToday = Math.round(totalEmployees * 0.92);
    const absentToday = Math.round(totalEmployees * 0.05);
    const lateToday = Math.round(totalEmployees * 0.03);

    return {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      averageWorkHours: 8.2,
      overtimeHours: 12.5,
      attendanceRate: 92.3,
    };
  }, [state.personnel]);

  const handleClockIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(
            `${position.coords.latitude}, ${position.coords.longitude}`,
          );
          setIsClockingIn(true);
          // Here you would call API to record clock in
          setTimeout(() => setIsClockingIn(false), 2000);
        },
        () => {
          setCurrentLocation("Location unavailable");
          setIsClockingIn(true);
          setTimeout(() => setIsClockingIn(false), 2000);
        },
      );
    }
  };

  const handleClockOut = () => {
    // Similar to clock in but for clock out
    setIsClockingIn(true);
    setTimeout(() => setIsClockingIn(false), 2000);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      present: { label: "လက်ရှိ", color: "bg-green-100 text-green-800" },
      absent: { label: "မလက်ရှိ", color: "bg-red-100 text-red-800" },
      late: { label: "နောက်ကျ", color: "bg-yellow-100 text-yellow-800" },
      "half-day": { label: "တစ်ဝက်နေ့", color: "bg-blue-100 text-blue-800" },
      holiday: { label: "လပ်ရက်", color: "bg-purple-100 text-purple-800" },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.present;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
              <Clock className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-myanmar-black">
                လက်ရှိမှု ခြေရာခံစနစ်
              </h1>
              <p className="text-sm text-myanmar-gray-dark">
                ဝန်ထမ်းများ၏ အလုပ်ချိန် နှင့် လက်ရှိမှု စီမံခန့်ခွဲမှု
              </p>
            </div>
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
                    ယနေ့ လက်ရှိမှုနှုန်း
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {attendanceStats.attendanceRate}%
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.3% မနေ့က
                  </p>
                </div>
                <UserCheck className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    လက်ရှိရှိနေသူများ
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {attendanceStats.presentToday}
                  </p>
                  <p className="text-sm text-myanmar-gray-dark">
                    /{attendanceStats.totalEmployees} ဝန်ထမ်း
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
                    နောက်ကျခဲ့သူများ
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {attendanceStats.lateToday}
                  </p>
                  <p className="text-sm text-yellow-600">ယနေ့</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    ပျမ်းမျှ အလုပ်ချိန်
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {attendanceStats.averageWorkHours}
                  </p>
                  <p className="text-sm text-myanmar-gray-dark">နာရီ / နေ့</p>
                </div>
                <Timer className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clock In/Out Section */}
        <Card className="border-myanmar-red/20 mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-myanmar-red" />
              မြန်ဆန်သော ချိန်မှတ်တမ်း
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Button
                  onClick={handleClockIn}
                  disabled={isClockingIn}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-lg"
                >
                  {isClockingIn ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      လုပ်ဆောင်နေ...
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-6 h-6 mr-2" />
                      အလုပ်ဝင်ချိန်
                    </>
                  )}
                </Button>
                <p className="text-sm text-myanmar-gray-dark mt-2">
                  အချိန်: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleClockOut}
                  disabled={isClockingIn}
                  className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg"
                >
                  <LogOut className="w-6 h-6 mr-2" />
                  အလုပ်ထွက်ချိန်
                </Button>
                <p className="text-sm text-myanmar-gray-dark mt-2">
                  တည်နေရာ: {currentLocation || "ရယူနေသည်..."}
                </p>
              </div>

              <div className="text-center">
                <Button className="w-full h-16 bg-yellow-600 hover:bg-yellow-700 text-white text-lg">
                  <Coffee className="w-6 h-6 mr-2" />
                  အနားယူချိန်
                </Button>
                <p className="text-sm text-myanmar-gray-dark mt-2">
                  ပုံမှန်: 12:00 - 13:00
                </p>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  className="w-full h-16 border-myanmar-red text-myanmar-red text-lg"
                >
                  <MapPin className="w-6 h-6 mr-2" />
                  တည်နေရာစစ်ဆေး
                </Button>
                <p className="text-sm text-myanmar-gray-dark mt-2">
                  GPS ခွင့်ပြုချက် လိုအပ်
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Tracking Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="today">ယနေ့</TabsTrigger>
            <TabsTrigger value="weekly">အပတ်စဉ���</TabsTrigger>
            <TabsTrigger value="monthly">လစဉ်</TabsTrigger>
            <TabsTrigger value="reports">အစီရင်ခံစာများ</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
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
                    <Label>ဌာန</Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger className="w-48 border-myanmar-red/30">
                        <SelectValue placeholder="ဌာနရွေးချယ်ရန်" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">အားလုံး</SelectItem>
                        {state.organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>အခြေအနေ</Label>
                    <Select
                      value={attendanceFilter}
                      onValueChange={setAttendanceFilter}
                    >
                      <SelectTrigger className="w-40 border-myanmar-red/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">အားလုံး</SelectItem>
                        <SelectItem value="present">လက်ရှိ</SelectItem>
                        <SelectItem value="absent">မလက်ရှိ</SelectItem>
                        <SelectItem value="late">နောက်ကျ</SelectItem>
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

            {/* Today's Attendance Table */}
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  ယနေ့ လက်ရှိမှုမှတ်တမ်း ({format(new Date(), "dd/MM/yyyy")})
                </h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ဝန်ထမ်း</TableHead>
                      <TableHead>ဌာန</TableHead>
                      <TableHead>ဝင်ချိန်</TableHead>
                      <TableHead>ထွက်ချိန်</TableHead>
                      <TableHead>အလုပ်ချိန်</TableHead>
                      <TableHead>အခြေအနေ</TableHead>
                      <TableHead>တည်နေရာ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.personnel
                      .filter((p) => p.status === "active")
                      .slice(0, 10)
                      .map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{person.name}</p>
                              <p className="text-sm text-myanmar-gray-dark">
                                {person.id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{person.organization}</TableCell>
                          <TableCell className="text-green-600">
                            08:30 AM
                          </TableCell>
                          <TableCell className="text-red-600">
                            05:45 PM
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">8.25 နာရီ</p>
                              <p className="text-sm text-myanmar-gray-dark">
                                +0.75 နာရီ ပိုလုပ်
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge("present")}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-myanmar-gray-dark" />
                              <span className="text-sm">Main Office</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  အပတ်စဉ် လက်ရှိမှု အကျဉ်းချုပ်
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {[
                    "တနင်္လာ",
                    "အင်္ဂါ",
                    "ဗုဒ္ဓဟူး",
                    "ကြာသပတေ���",
                    "သောကြာ",
                    "စနေ",
                    "တနင်္ဂနွေ",
                  ].map((day, index) => (
                    <div
                      key={day}
                      className="text-center p-4 border border-myanmar-red/20 rounded-lg"
                    >
                      <h4 className="font-medium text-myanmar-black mb-2">
                        {day}
                      </h4>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(
                            attendanceStats.presentToday *
                              (0.9 + Math.random() * 0.2),
                          )}
                        </p>
                        <p className="text-sm text-myanmar-gray-dark">
                          {Math.round(92 + Math.random() * 8)}% နှုန်း
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    လစဉ် လက်ရှိမှုနှုန်း
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>စုစုပေါင်း အလုပ်ရက်များ</span>
                      <Badge className="bg-blue-100 text-blue-800">22</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ပျမ်းမျှ လက်ရှိမှုနှုန်း</span>
                      <Badge className="bg-green-100 text-green-800">
                        {attendanceStats.attendanceRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>စုစုပေါင်း နောက်ကျမှုများ</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {attendanceStats.lateToday * 10}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ပိုလုပ်ချိန် (နာရီ)</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {attendanceStats.overtimeHours}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    ပြဿနာများ နှင့် သတိပေးချက်များ
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">
                          မကြေးမုံ ညိုမြင့် - အဆက်မပြတ် 3 နေ့ မလာခဲ့
                        </p>
                        <p className="text-sm text-red-600">
                          အရေးယူမှု လိုအပ်သည်
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          နည်းပညာဌာန - နောက်ကျမှု မြင့်မားနေ
                        </p>
                        <p className="text-sm text-yellow-600">
                          ဤအပတ် 15% နောက်ကျမှုနှုန်း
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">
                          ပိုလုပ်ချိန် များနေသည်
                        </p>
                        <p className="text-sm text-blue-600">
                          လစဉ် ပျမ်းမျှ 12.5 နာရီ ပိုလုပ်နေ
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <FileText className="w-8 h-8 text-myanmar-red" />
                  <h3 className="font-semibold">နေ့စဉ် အစီရင်ခံစာ</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-myanmar-gray-dark mb-4">
                    နေ့စဉ် လက်ရှိမှု အခြေအနေများ
                  </p>
                  <Button className="w-full bg-myanmar-red hover:bg-myanmar-red-dark">
                    <Download className="w-4 h-4 mr-2" />
                    ယနေ့ အစီရင်ခံစာ
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-myanmar-red" />
                  <h3 className="font-semibold">လစဉ် ခွဲခြမ်းစိတ်ဖြာမှု</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-myanmar-gray-dark mb-4">
                    လစဉ် လက်ရှိမှု ခွဲခြမ်းစိတ်ဖြာမှု
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-myanmar-red text-myanmar-red"
                  >
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
                    တစ်ဦးချင်း ဝန်ထမ်း လက်ရှိမှုမှတ်တမ်း
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-myanmar-red text-myanmar-red"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    တစ်ဦးချင်းအစီရင်ခံစာ
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
