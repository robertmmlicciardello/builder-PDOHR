import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Clock,
  Calendar,
  Users,
  Video,
  Link as LinkIcon,
  FileText,
  Download,
  Eye,
  Check,
  X,
  ArrowLeft,
  Settings,
  Copy,
  ExternalLink,
  MapPin,
  Bell,
  Play,
  Pause,
  Square,
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

// Meeting interfaces
export interface Meeting {
  id: string;
  title: string;
  titleMyanmar: string;
  description?: string;
  descriptionMyanmar?: string;
  type: MeetingType;
  status: MeetingStatus;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location?: string;
  locationMyanmar?: string;
  meetingLink?: string;
  passcode?: string;
  organizer: string;
  participants: MeetingParticipant[];
  agenda: AgendaItem[];
  minutes?: string;
  minutesMyanmar?: string;
  attachments: MeetingAttachment[];
  isRecurring: boolean;
  recurrenceRule?: string;
  reminderMinutes: number;
  isPrivate: boolean;
  maxParticipants?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  nameMyanmar?: string;
  email?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  titleMyanmar?: string;
  description?: string;
  estimatedDuration: number; // in minutes
  presenter?: string;
  order: number;
  isCompleted: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
}

export interface MeetingAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export type MeetingType =
  | "general"
  | "department"
  | "training"
  | "planning"
  | "review"
  | "emergency";
export type MeetingStatus =
  | "scheduled"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "postponed";
export type ParticipantRole =
  | "organizer"
  | "presenter"
  | "required"
  | "optional";
export type ParticipantStatus =
  | "invited"
  | "accepted"
  | "declined"
  | "tentative"
  | "attended"
  | "absent";

// Default meeting data
const initialMeetingData: Omit<
  Meeting,
  "id" | "createdAt" | "updatedAt" | "createdBy"
> = {
  title: "",
  titleMyanmar: "",
  description: "",
  descriptionMyanmar: "",
  type: "general",
  status: "scheduled",
  startDateTime: new Date().toISOString().slice(0, 16),
  endDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  timezone: "Asia/Yangon",
  location: "",
  locationMyanmar: "",
  meetingLink: "",
  passcode: "",
  organizer: "Current User",
  participants: [],
  agenda: [],
  minutes: "",
  minutesMyanmar: "",
  attachments: [],
  isRecurring: false,
  recurrenceRule: "",
  reminderMinutes: 15,
  isPrivate: false,
  maxParticipants: 50,
};

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState(initialMeetingData);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<MeetingType | "all">("all");
  const [activeTab, setActiveTab] = useState("scheduled");
  const [currentTimer, setCurrentTimer] = useState<{
    meetingId: string;
    startTime: number;
    elapsed: number;
    isRunning: boolean;
  } | null>(null);

  // Load meetings from localStorage
  useEffect(() => {
    const loadMeetings = () => {
      try {
        const stored = localStorage.getItem("pdf-meetings");
        if (stored) {
          setMeetings(JSON.parse(stored));
        } else {
          // Initialize with sample data
          const sampleMeetings: Meeting[] = [
            {
              id: "meeting-1",
              title: "Weekly Department Meeting",
              titleMyanmar: "အပတ်စဉ် ဌာနအစည်းအဝေး",
              description:
                "Regular weekly meeting to discuss progress and upcoming tasks",
              descriptionMyanmar:
                "တိုးတက်မှုနှင့် လာမည့်အလုပ်များကို ဆွေးနွေးရန် ပုံမှန်အပတ်စဉ်အစည်းအဝေး",
              type: "department",
              status: "scheduled",
              startDateTime: new Date(Date.now() + 86400000)
                .toISOString()
                .slice(0, 16),
              endDateTime: new Date(Date.now() + 86400000 + 3600000)
                .toISOString()
                .slice(0, 16),
              timezone: "Asia/Yangon",
              location: "Conference Room A",
              locationMyanmar: "ညီလာခမ်းခန်း (က)",
              meetingLink: "https://meet.google.com/xyz-abc-def",
              organizer: "Admin User",
              participants: [
                {
                  id: "p1",
                  name: "John Doe",
                  nameMyanmar: "ဂျွန်ဒို",
                  role: "required",
                  status: "accepted",
                },
                {
                  id: "p2",
                  name: "Jane Smith",
                  nameMyanmar: "ဂျိန်းစမစ်",
                  role: "required",
                  status: "invited",
                },
              ],
              agenda: [
                {
                  id: "a1",
                  title: "Progress Review",
                  titleMyanmar: "တိုးတက်မှုပြန်လည်သုံးသပ်ခြင်း",
                  estimatedDuration: 30,
                  order: 1,
                  isCompleted: false,
                },
                {
                  id: "a2",
                  title: "Upcoming Tasks",
                  titleMyanmar: "လာမည့်အလုပ်များ",
                  estimatedDuration: 20,
                  order: 2,
                  isCompleted: false,
                },
              ],
              attachments: [],
              isRecurring: true,
              recurrenceRule: "weekly",
              reminderMinutes: 15,
              isPrivate: false,
              maxParticipants: 20,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: "admin",
            },
          ];
          setMeetings(sampleMeetings);
          localStorage.setItem("pdf-meetings", JSON.stringify(sampleMeetings));
        }
      } catch (error) {
        console.error("Failed to load meetings:", error);
      }
    };

    loadMeetings();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer?.isRunning) {
      interval = setInterval(() => {
        setCurrentTimer((prev) =>
          prev
            ? {
                ...prev,
                elapsed: Date.now() - prev.startTime,
              }
            : null,
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTimer?.isRunning]);

  // Save meetings to localStorage
  const saveMeetings = (newMeetings: Meeting[]) => {
    try {
      localStorage.setItem("pdf-meetings", JSON.stringify(newMeetings));
      setMeetings(newMeetings);
    } catch (error) {
      console.error("Failed to save meetings:", error);
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.titleMyanmar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.organizer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || meeting.status === statusFilter;
      const matchesType = typeFilter === "all" || meeting.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [meetings, searchTerm, statusFilter, typeFilter]);

  const handleOpenDialog = (meeting?: Meeting) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setFormData({
        title: meeting.title,
        titleMyanmar: meeting.titleMyanmar,
        description: meeting.description || "",
        descriptionMyanmar: meeting.descriptionMyanmar || "",
        type: meeting.type,
        status: meeting.status,
        startDateTime: meeting.startDateTime,
        endDateTime: meeting.endDateTime,
        timezone: meeting.timezone,
        location: meeting.location || "",
        locationMyanmar: meeting.locationMyanmar || "",
        meetingLink: meeting.meetingLink || "",
        passcode: meeting.passcode || "",
        organizer: meeting.organizer,
        participants: meeting.participants,
        agenda: meeting.agenda,
        minutes: meeting.minutes || "",
        minutesMyanmar: meeting.minutesMyanmar || "",
        attachments: meeting.attachments,
        isRecurring: meeting.isRecurring,
        recurrenceRule: meeting.recurrenceRule || "",
        reminderMinutes: meeting.reminderMinutes,
        isPrivate: meeting.isPrivate,
        maxParticipants: meeting.maxParticipants,
      });
    } else {
      setEditingMeeting(null);
      setFormData(initialMeetingData);
    }
    setErrors([]);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMeeting(null);
    setFormData(initialMeetingData);
    setErrors([]);
  };

  const validateMeeting = (data: typeof formData): string[] => {
    const errors: string[] = [];

    if (!data.title.trim()) {
      errors.push("Meeting title is required");
    }

    if (!data.titleMyanmar.trim()) {
      errors.push("Myanmar title is required");
    }

    if (!data.startDateTime) {
      errors.push("Start date and time is required");
    }

    if (!data.endDateTime) {
      errors.push("End date and time is required");
    }

    if (new Date(data.startDateTime) >= new Date(data.endDateTime)) {
      errors.push("End time must be after start time");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateMeeting(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const now = new Date().toISOString();

      if (editingMeeting) {
        // Update existing meeting
        const updatedMeetings = meetings.map((meeting) =>
          meeting.id === editingMeeting.id
            ? { ...meeting, ...formData, updatedAt: now }
            : meeting,
        );
        saveMeetings(updatedMeetings);
      } else {
        // Create new meeting
        const newMeeting: Meeting = {
          id: `meeting-${Date.now()}`,
          ...formData,
          createdAt: now,
          updatedAt: now,
          createdBy: "current-user",
        };
        saveMeetings([...meetings, newMeeting]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save meeting:", error);
      setErrors(["Failed to save meeting. Please try again."]);
    }
  };

  const handleDelete = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (meetingToDelete) {
      const updatedMeetings = meetings.filter(
        (m) => m.id !== meetingToDelete.id,
      );
      saveMeetings(updatedMeetings);
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  const startMeetingTimer = (meetingId: string) => {
    setCurrentTimer({
      meetingId,
      startTime: Date.now(),
      elapsed: 0,
      isRunning: true,
    });

    // Update meeting status to ongoing
    const updatedMeetings = meetings.map((meeting) =>
      meeting.id === meetingId
        ? {
            ...meeting,
            status: "ongoing" as MeetingStatus,
            actualStartTime: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : meeting,
    );
    saveMeetings(updatedMeetings);
  };

  const stopMeetingTimer = (meetingId: string) => {
    if (currentTimer && currentTimer.meetingId === meetingId) {
      // Update meeting status to completed
      const updatedMeetings = meetings.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              status: "completed" as MeetingStatus,
              actualEndTime: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : meeting,
      );
      saveMeetings(updatedMeetings);
      setCurrentTimer(null);
    }
  };

  const pauseMeetingTimer = () => {
    if (currentTimer) {
      setCurrentTimer((prev) => (prev ? { ...prev, isRunning: false } : null));
    }
  };

  const resumeMeetingTimer = () => {
    if (currentTimer) {
      setCurrentTimer((prev) =>
        prev
          ? {
              ...prev,
              isRunning: true,
              startTime: Date.now() - prev.elapsed,
            }
          : null,
      );
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // Show toast notification
  };

  const getStatusBadgeVariant = (status: MeetingStatus) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "ongoing":
        return "destructive";
      case "completed":
        return "secondary";
      case "cancelled":
        return "outline";
      case "postponed":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeBadgeColor = (type: MeetingType) => {
    switch (type) {
      case "emergency":
        return "bg-red-600";
      case "training":
        return "bg-blue-600";
      case "planning":
        return "bg-purple-600";
      case "review":
        return "bg-orange-600";
      case "department":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Meeting Management
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  Manage PDF meetings, schedules, and participants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentTimer && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-700">
                    {formatDuration(currentTimer.elapsed)}
                  </span>
                  <div className="flex space-x-1">
                    {currentTimer.isRunning ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={pauseMeetingTimer}
                        className="h-6 w-6 p-0"
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resumeMeetingTimer}
                        className="h-6 w-6 p-0"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stopMeetingTimer(currentTimer.meetingId)}
                      className="h-6 w-6 p-0"
                    >
                      <Square className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-myanmar-red hover:bg-myanmar-red/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold text-myanmar-black">
                    {meetings.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-green-600">
                    {meetings.filter((m) => m.status === "scheduled").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ongoing</p>
                  <p className="text-2xl font-bold text-red-600">
                    {meetings.filter((m) => m.status === "ongoing").length}
                  </p>
                </div>
                <Video className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {meetings.filter((m) => m.status === "completed").length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as MeetingStatus | "all")
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as MeetingType | "all")
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Meetings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-myanmar-red" />
              Meetings ({filteredMeetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-myanmar-gray-dark">No meetings found</p>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="mt-4 bg-myanmar-red hover:bg-myanmar-red/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Meeting
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          <div className="text-sm text-gray-500">
                            {meeting.titleMyanmar}
                          </div>
                          {meeting.meetingLink && (
                            <div className="flex items-center gap-2 mt-1">
                              <LinkIcon className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-600">
                                Online Meeting
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getTypeBadgeColor(meeting.type)} text-white`}
                        >
                          {meeting.type.charAt(0).toUpperCase() +
                            meeting.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(
                              meeting.startDateTime,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(meeting.startDateTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
                            -{" "}
                            {new Date(meeting.endDateTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          (new Date(meeting.endDateTime).getTime() -
                            new Date(meeting.startDateTime).getTime()) /
                            (1000 * 60),
                        )}{" "}
                        min
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {meeting.participants.length}
                          </span>
                          {meeting.maxParticipants && (
                            <span className="text-sm text-gray-500">
                              /{meeting.maxParticipants}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(meeting.status)}>
                          {meeting.status.charAt(0).toUpperCase() +
                            meeting.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {meeting.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startMeetingTimer(meeting.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}

                          {meeting.meetingLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyMeetingLink(meeting.meetingLink!)
                              }
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(meeting)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(meeting)}
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

      {/* Add/Edit Meeting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Meeting Title (English) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Weekly Department Meeting"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleMyanmar">
                      Meeting Title (Myanmar) *
                    </Label>
                    <Input
                      id="titleMyanmar"
                      value={formData.titleMyanmar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleMyanmar: e.target.value,
                        })
                      }
                      placeholder="e.g., အပတ်စဉ် ဌာနအစည်းအဝေး"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value as MeetingType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants:
                            parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="50"
                      min="1"
                      max="500"
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Meeting description..."
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
                      placeholder="အစည်းအဝေးဖော်ပြချက်..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDateTime">Start Date & Time *</Label>
                    <Input
                      id="startDateTime"
                      type="datetime-local"
                      value={formData.startDateTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDateTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDateTime">End Date & Time *</Label>
                    <Input
                      id="endDateTime"
                      type="datetime-local"
                      value={formData.endDateTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDateTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location (English)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Conference Room A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationMyanmar">Location (Myanmar)</Label>
                    <Input
                      id="locationMyanmar"
                      value={formData.locationMyanmar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationMyanmar: e.target.value,
                        })
                      }
                      placeholder="ညီလာခမ်းခန်း (က)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input
                      id="meetingLink"
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingLink: e.target.value,
                        })
                      }
                      placeholder="https://meet.google.com/xyz-abc-def"
                      type="url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passcode">Passcode (Optional)</Label>
                    <Input
                      id="passcode"
                      value={formData.passcode}
                      onChange={(e) =>
                        setFormData({ ...formData, passcode: e.target.value })
                      }
                      placeholder="Meeting passcode"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminderMinutes">
                      Reminder (minutes before)
                    </Label>
                    <Select
                      value={formData.reminderMinutes.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          reminderMinutes: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isRecurring: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isRecurring">Recurring Meeting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPrivate: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isPrivate">Private Meeting</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>
                    Participant management will be available in future updates
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Agenda management will be available in future updates</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-myanmar-red hover:bg-myanmar-red/90"
              >
                {editingMeeting ? "Update Meeting" : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{meetingToDelete?.title}"? This
              action cannot be undone.
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
