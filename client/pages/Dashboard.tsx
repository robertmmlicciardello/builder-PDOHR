import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Personnel, PersonnelFilters } from "@shared/personnel";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Plus, Search, Users, FileText, Settings, LogOut } from "lucide-react";

export default function Dashboard() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PersonnelFilters>({});

  const filteredPersonnel = useMemo(() => {
    let filtered = state.personnel;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.id.toLowerCase().includes(searchLower) ||
          p.name.toLowerCase().includes(searchLower) ||
          p.rank.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [state.personnel, filters]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const newThisMonth = state.personnel.filter((p) => {
      const joinDate = new Date(p.dateOfJoining);
      return (
        joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear
      );
    }).length;

    const resignationsThisMonth = state.personnel.filter((p) => {
      if (!p.dateOfLeaving) return false;
      const leaveDate = new Date(p.dateOfLeaving);
      return (
        leaveDate.getMonth() === thisMonth &&
        leaveDate.getFullYear() === thisYear
      );
    }).length;

    const activePersonnel = state.personnel.filter(
      (p) => !p.dateOfLeaving,
    ).length;

    return {
      total: state.personnel.length,
      active: activePersonnel,
      newThisMonth,
      resignationsThisMonth,
    };
  }, [state.personnel]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">✊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  PDF-Tech
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  Personnel Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-myanmar-gray-dark">
                Welcome, {state.user?.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    Total Personnel
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {stats.total}
                  </p>
                </div>
                <Users className="w-8 h-8 text-myanmar-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    Active Personnel
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {stats.active}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    New This Month
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {stats.newThisMonth}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">New</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    Left This Month
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {stats.resignationsThisMonth}
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-800">Left</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-4">
            <Link to="/add-personnel">
              <Button className="bg-myanmar-red hover:bg-myanmar-red-dark text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
            </Link>
            <Link to="/reports">
              <Button
                variant="outline"
                className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myanmar-gray-dark w-4 h-4" />
            <Input
              placeholder="Search by ID, name, or rank..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10 w-80 border-myanmar-red/30 focus:border-myanmar-red"
            />
          </div>
        </div>

        {/* Personnel Table */}
        <Card className="border-myanmar-red/20">
          <CardHeader>
            <h3 className="text-lg font-semibold text-myanmar-black">
              Personnel Records ({filteredPersonnel.length})
            </h3>
          </CardHeader>
          <CardContent>
            {filteredPersonnel.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-myanmar-gray-dark mx-auto mb-4" />
                <p className="text-myanmar-gray-dark">
                  {state.personnel.length === 0
                    ? "No personnel records found. Add your first record to get started."
                    : "No personnel match your search criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Duties</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonnel.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-mono text-myanmar-red">
                        {person.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {person.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{person.rank}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(person.dateOfJoining)}</TableCell>
                      <TableCell>
                        {person.dateOfLeaving ? (
                          <Badge className="bg-red-100 text-red-800">
                            Left {formatDate(person.dateOfLeaving)}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {person.assignedDuties}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/edit-personnel/${person.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                            >
                              Edit
                            </Button>
                          </Link>
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
    </div>
  );
}
