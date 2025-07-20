import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Award,
  TrendingUp,
  ArrowLeft,
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  PerformanceReview,
  PerformanceGoal,
  CompetencyRating,
  Priority,
  GoalStatus,
  ReviewStatus,
} from "../../shared/hr-system";

interface PerformanceReviewFormData {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: {
    start: string;
    end: string;
  };
  overallRating: number;
  goals: PerformanceGoal[];
  competencies: CompetencyRating[];
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: string[];
  comments: string;
  status: ReviewStatus;
}

const initialFormData: PerformanceReviewFormData = {
  employeeId: "",
  reviewerId: "",
  reviewPeriod: {
    start: "",
    end: "",
  },
  overallRating: 3,
  goals: [],
  competencies: [],
  achievements: [],
  areasForImprovement: [],
  developmentPlan: [],
  comments: "",
  status: "pending",
};

export const PerformanceManagement: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  // Sample data - in real app, this would come from API
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([
    {
      id: "perf-001",
      employeeId: "emp-001",
      reviewerId: "emp-002",
      reviewPeriod: {
        start: "2024-01-01",
        end: "2024-06-30",
      },
      overallRating: 4,
      goals: [
        {
          id: "goal-001",
          description: "Complete React training certification",
          targetDate: "2024-03-31",
          priority: "high",
          status: "completed",
          rating: 5,
          comments: "Excellent completion ahead of schedule",
        },
        {
          id: "goal-002",
          description: "Lead team project for new dashboard",
          targetDate: "2024-06-30",
          priority: "high",
          status: "in-progress",
          rating: 4,
        },
      ],
      competencies: [
        {
          competencyName: "Technical Skills",
          rating: 4,
          comments: "Strong technical abilities",
        },
        {
          competencyName: "Communication",
          rating: 4,
          comments: "Good communication skills",
        },
        {
          competencyName: "Leadership",
          rating: 3,
          comments: "Developing leadership potential",
        },
      ],
      achievements: [
        "Successfully delivered 3 major projects",
        "Mentored 2 junior developers",
        "Improved code quality metrics by 25%",
      ],
      areasForImprovement: [
        "Time management skills",
        "Public speaking confidence",
      ],
      developmentPlan: [
        "Attend time management workshop",
        "Join Toastmasters for public speaking",
        "Shadow senior manager for leadership experience",
      ],
      comments:
        "Excellent performance with strong technical skills and good team collaboration.",
      status: "completed",
      submittedDate: "2024-07-01T00:00:00.000Z",
      approvedDate: "2024-07-05T00:00:00.000Z",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-07-05T00:00:00.000Z",
    },
  ]);

  // Sample employees for dropdowns
  const [employees] = useState([
    { id: "emp-001", name: "John Doe", nameMyanmar: "ဂျွန်ဒိုး" },
    { id: "emp-002", name: "Jane Smith", nameMyanmar: "ဂျိန်းစမစ်" },
    { id: "emp-003", name: "Bob Johnson", nameMyanmar: "ဘောဘ်ဂျွန်ဆင်" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(
    null,
  );
  const [formData, setFormData] =
    useState<PerformanceReviewFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Helper function to get employee name
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return "Unknown";
    return currentLanguage === "mm" ? employee.nameMyanmar : employee.name;
  };

  // Helper function to get rating stars
  const getRatingStars = (rating: number): string => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Helper function to get status color
  const getStatusColor = (status: ReviewStatus): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filtered performance reviews
  const filteredReviews = useMemo(() => {
    return performanceReviews
      .filter((review) => {
        const employeeName = getEmployeeName(review.employeeId).toLowerCase();
        const reviewerName = getEmployeeName(review.reviewerId).toLowerCase();

        const matchesSearch =
          employeeName.includes(searchTerm.toLowerCase()) ||
          reviewerName.includes(searchTerm.toLowerCase()) ||
          review.comments.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          filterStatus === "all" || review.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [performanceReviews, searchTerm, filterStatus, currentLanguage]);

  // Form handling
  const handleInputChange = (
    field: keyof PerformanceReviewFormData,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.employeeId) {
      errors.push(t.validation.required + " - Employee");
    }
    if (!formData.reviewerId) {
      errors.push(t.validation.required + " - Reviewer");
    }
    if (!formData.reviewPeriod.start) {
      errors.push(t.validation.required + " - Start Date");
    }
    if (!formData.reviewPeriod.end) {
      errors.push(t.validation.required + " - End Date");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingReview) {
      // Update existing review
      setPerformanceReviews((prev) =>
        prev.map((review) =>
          review.id === editingReview.id
            ? {
                ...review,
                ...formData,
                updatedAt: now,
              }
            : review,
        ),
      );
    } else {
      // Create new review
      const newReview: PerformanceReview = {
        id: `perf-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setPerformanceReviews((prev) => [...prev, newReview]);
    }

    handleCloseDialog();
  };

  const handleEdit = (review: PerformanceReview) => {
    setEditingReview(review);
    setFormData({
      employeeId: review.employeeId,
      reviewerId: review.reviewerId,
      reviewPeriod: review.reviewPeriod,
      overallRating: review.overallRating,
      goals: review.goals,
      competencies: review.competencies,
      achievements: review.achievements,
      areasForImprovement: review.areasForImprovement,
      developmentPlan: review.developmentPlan,
      comments: review.comments,
      status: review.status,
    });
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  const handleDelete = (reviewId: string) => {
    setPerformanceReviews((prev) =>
      prev.filter((review) => review.id !== reviewId),
    );
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReview(null);
    setFormData(initialFormData);
    setFormErrors([]);
  };

  const handleAddNew = () => {
    setEditingReview(null);
    setFormData(initialFormData);
    setFormErrors([]);
    setIsDialogOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = performanceReviews.length;
    const completed = performanceReviews.filter(
      (r) => r.status === "completed",
    ).length;
    const pending = performanceReviews.filter(
      (r) => r.status === "pending",
    ).length;
    const overdue = performanceReviews.filter(
      (r) => r.status === "overdue",
    ).length;
    const avgRating =
      performanceReviews.reduce((sum, r) => sum + r.overallRating, 0) / total ||
      0;

    return { total, completed, pending, overdue, avgRating };
  }, [performanceReviews]);

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
                {t.hr.performance} {t.actions.manage}
              </h1>
              <p className="text-gray-600 mt-1">
                Performance Reviews & Goal Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.common.total}</p>
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
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.status.completed}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.status.pending}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.status.overdue}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.avgRating.toFixed(1)}
                  </p>
                </div>
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
                    placeholder="Search by employee, reviewer, or comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {getEmployeeName(review.employeeId)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Reviewed by: {getEmployeeName(review.reviewerId)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.reviewPeriod.start} to {review.reviewPeriod.end}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-yellow-600">
                        {getRatingStars(review.overallRating)}
                      </span>
                      <p className="text-sm text-gray-600">
                        {review.overallRating}/5
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Goals Progress</p>
                    <div className="flex gap-1 mt-1">
                      {review.goals.map((goal, index) => (
                        <Badge
                          key={index}
                          variant={
                            goal.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {goal.status}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Key Achievements</p>
                    <p className="text-sm">
                      {review.achievements.length} achievements recorded
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Comments</p>
                    <p className="text-sm line-clamp-2">{review.comments}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(review.updatedAt).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
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
                              Delete Performance Review
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this performance
                              review for {getEmployeeName(review.employeeId)}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
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

        {filteredReviews.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No performance reviews found</p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Performance Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReview
                  ? "Edit Performance Review"
                  : "Create Performance Review"}
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
                  <Label htmlFor="employee">Employee *</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) =>
                      handleInputChange("employeeId", value)
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
                  <Label htmlFor="reviewer">Reviewer *</Label>
                  <Select
                    value={formData.reviewerId}
                    onValueChange={(value) =>
                      handleInputChange("reviewerId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Review Period Start *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.reviewPeriod.start}
                    onChange={(e) =>
                      handleInputChange("reviewPeriod", {
                        ...formData.reviewPeriod,
                        start: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Review Period End *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.reviewPeriod.end}
                    onChange={(e) =>
                      handleInputChange("reviewPeriod", {
                        ...formData.reviewPeriod,
                        end: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Overall Rating (1-5) *</Label>
                  <Select
                    value={formData.overallRating.toString()}
                    onValueChange={(value) =>
                      handleInputChange("overallRating", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2 - Below Average</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
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
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) =>
                    handleInputChange("comments", e.target.value)
                  }
                  placeholder="Performance review comments..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingReview ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PerformanceManagement;
