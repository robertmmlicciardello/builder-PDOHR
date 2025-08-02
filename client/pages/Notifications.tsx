import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Bell,
  Calendar,
  AlertTriangle,
  Award,
  UserPlus,
  CheckCircle,
  Clock,
  Filter,
  MarkdownIcon as MarkAsRead,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  type: "leave_request" | "overdue_review" | "birthday" | "new_hire" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  data?: any;
}

export default function Notifications() {
  const { state } = useApp();
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  // Generate notifications based on dashboard data
  const notifications = useMemo((): Notification[] => {
    const now = new Date();
    const notifications: Notification[] = [];

    // Pending leave requests
    for (let i = 0; i < 8; i++) {
      notifications.push({
        id: `leave-${i + 1}`,
        type: "leave_request",
        title: "Leave Request Pending",
        message: `${["ဦးမြင့်မြတ်", "ဒေါ်ခင်ဇော်", "ဦးသန့်ဝင်း", "ဒေါ်နှင်းလေး", "ဦးကျော်ထူး", "ဒေါ်မီမီသန့်", "ဦးအောင်မြင့်", "ဒေါ်သင်းသင်း"][i]} has requested annual leave from ${new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.6,
        priority: "medium",
      });
    }

    // Overdue reviews
    for (let i = 0; i < 3; i++) {
      notifications.push({
        id: `review-${i + 1}`,
        type: "overdue_review",
        title: "Performance Review Overdue",
        message: `Performance review for ${["ဦးမြင့်မြတ်", "ဒေါ်ခင်ဇော်", "ဦးသန့်ဝင်း"][i]} is ${Math.floor(Math.random() * 30) + 1} days overdue`,
        timestamp: new Date(Date.now() - (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: "high",
      });
    }

    // Upcoming birthdays
    for (let i = 0; i < 5; i++) {
      notifications.push({
        id: `birthday-${i + 1}`,
        type: "birthday",
        title: "Upcoming Birthday",
        message: `${["ဒေါ်နှင်းလေး", "ဦးကျော်ထူး", "ဒေါ်မီမီသန့်", "ဦးအောင်မြင့်", "ဒေါ်သင်းသင်း"][i]}'s birthday is coming up this week`,
        timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.4,
        priority: "low",
      });
    }

    // New hires (if any)
    const newHires = state.personnel.filter((p) => {
      const joinDate = new Date(p.dateOfJoining);
      const monthsAgo = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo < 1 && p.status === "active";
    });

    newHires.forEach((hire, index) => {
      notifications.push({
        id: `hire-${hire.id}`,
        type: "new_hire",
        title: "New Employee Joined",
        message: `${hire.name} has joined as ${hire.rank} in ${hire.organization}`,
        timestamp: hire.dateOfJoining,
        isRead: Math.random() > 0.3,
        priority: "medium",
        data: hire,
      });
    });

    // System notifications
    notifications.push({
      id: "system-backup",
      type: "system",
      title: "System Backup Completed",
      message: "Daily backup completed successfully. All data is secure.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      priority: "low",
    });

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.personnel]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "high") return notification.priority === "high";
    return true;
  });

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "overdue_review":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "birthday":
        return <Award className="w-5 h-5 text-green-500" />;
      case "new_hire":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "system":
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-myanmar-red" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-myanmar-black">
                Notifications
              </h1>
              <p className="text-sm text-myanmar-gray-dark">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="border-myanmar-red/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Tabs value={filter} onValueChange={setFilter as any}>
                <TabsList>
                  <TabsTrigger value="all">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="high">
                    High Priority ({notifications.filter(n => n.priority === "high").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <MarkAsRead className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="border-myanmar-red/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-myanmar-black mb-2">
                  All caught up!
                </h3>
                <p className="text-myanmar-gray-dark">
                  No notifications match your current filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-myanmar-red/20 transition-all hover:shadow-md ${
                  !notification.isRead ? "bg-blue-50/50 border-blue-200" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold text-myanmar-black">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-myanmar-gray-dark mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-myanmar-gray" />
                            <span className="text-xs text-myanmar-gray">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm">
                              <MarkAsRead className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" className="border-myanmar-red text-myanmar-red">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
