import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import {
  Personnel,
  PersonnelStatus,
  getStatusInEnglish,
  getStatusInBurmese,
} from "@shared/personnel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Edit,
  Eye,
  Download,
  Plus,
  ArrowLeft,
  Trash2,
} from "lucide-react";

export default function PersonnelList() {
  const { state, deletePersonnel } = useApp();
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PersonnelStatus | "all">(
    "all",
  );
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
    null,
  );

  // Get unique organizations
  const organizations = useMemo(() => {
    const orgs = [...new Set(state.personnel.map((p) => p.organization))];
    return orgs.filter(Boolean);
  }, [state.personnel]);

  // Filter and search personnel
  const filteredPersonnel = useMemo(() => {
    return state.personnel.filter((person) => {
      const matchesSearch =
        person.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.rank.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || person.status === statusFilter;
      const matchesOrg =
        organizationFilter === "all" ||
        person.organization === organizationFilter;

      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [state.personnel, searchTerm, statusFilter, organizationFilter]);

  const getStatusBadgeColor = (status: PersonnelStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "resigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200";
      case "deceased":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDelete = async () => {
    if (selectedPersonnel) {
      try {
        await deletePersonnel(selectedPersonnel.id);
        setDeleteDialogOpen(false);
        setSelectedPersonnel(null);
      } catch (error) {
        console.error("Failed to delete personnel:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

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
                <span className="text-white text-xl font-bold">✊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Personnel List
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  PDF-Tech Personnel Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/add-personnel">
                <Button className="bg-myanmar-red hover:bg-myanmar-red-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Personnel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters and Search */}
        <Card className="border-myanmar-red/20 mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-myanmar-red" />
              <h2 className="text-lg font-semibold text-myanmar-black">
                Personnel Management
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by ID, name, or rank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-myanmar-red/30 focus:border-myanmar-red"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as PersonnelStatus | "all")
                }
              >
                <SelectTrigger className="border-myanmar-red/30 focus:border-myanmar-red">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={organizationFilter}
                onValueChange={setOrganizationFilter}
              >
                <SelectTrigger className="border-myanmar-red/30 focus:border-myanmar-red">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
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

        {/* Personnel Table */}
        <Card className="border-myanmar-red/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-myanmar-red/5">
                    <TableHead className="text-myanmar-black font-semibold">
                      ID
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Rank
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Organization
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Join Date
                    </TableHead>
                    <TableHead className="text-myanmar-black font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonnel.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-myanmar-gray-dark"
                      >
                        No personnel found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPersonnel.map((person) => (
                      <TableRow key={person.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-myanmar-red">
                          {person.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {person.name}
                        </TableCell>
                        <TableCell>{person.rank}</TableCell>
                        <TableCell>{person.organization}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(person.status)}>
                            {currentLanguage === "mm"
                              ? getStatusInBurmese(person.status)
                              : getStatusInEnglish(person.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(person.dateOfJoining)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link to={`/edit-personnel/${person.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => {
                                setSelectedPersonnel(person);
                                setDeleteDialogOpen(true);
                              }}
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
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="border-myanmar-red/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-myanmar-black">
                  {filteredPersonnel.length}
                </p>
                <p className="text-sm text-myanmar-gray-dark">
                  Total Displayed
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredPersonnel.filter((p) => p.status === "active")
                      .length
                  }
                </p>
                <p className="text-sm text-myanmar-gray-dark">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    filteredPersonnel.filter((p) => p.status === "resigned")
                      .length
                  }
                </p>
                <p className="text-sm text-myanmar-gray-dark">Resigned</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredPersonnel.filter((p) => p.status === "terminated")
                    .length +
                    filteredPersonnel.filter((p) => p.status === "deceased")
                      .length}
                </p>
                <p className="text-sm text-myanmar-gray-dark">Inactive</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete personnel record for{" "}
              <strong>{selectedPersonnel?.name}</strong> (ID:{" "}
              {selectedPersonnel?.id})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
