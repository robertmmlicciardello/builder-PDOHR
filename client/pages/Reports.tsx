import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PersonnelReport } from "@shared/personnel";
import { Button } from "../components/ui/button";
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
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";

export default function Reports() {
  const { state } = useApp();

  const report: PersonnelReport = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const activePersonnel = state.personnel.filter((p) => !p.dateOfLeaving);

    const newEntries = state.personnel.filter((p) => {
      const joinDate = new Date(p.dateOfJoining);
      return (
        joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear
      );
    }).length;

    const resignations = state.personnel.filter((p) => {
      if (!p.dateOfLeaving) return false;
      const leaveDate = new Date(p.dateOfLeaving);
      return (
        leaveDate.getMonth() === thisMonth &&
        leaveDate.getFullYear() === thisYear
      );
    }).length;

    const byRank = state.personnel.reduce(
      (acc, person) => {
        if (!person.dateOfLeaving) {
          // Only count active personnel
          acc[person.rank] = (acc[person.rank] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const byOrganization = state.personnel.reduce(
      (acc, person) => {
        if (!person.dateOfLeaving) {
          // Only count active personnel
          acc[person.organization] = (acc[person.organization] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const activeMembers = activePersonnel.length;
    const resignedMembers = state.personnel.filter(
      (p) => p.status === "resigned",
    ).length;
    const deceasedMembers = state.personnel.filter(
      (p) => p.status === "deceased",
    ).length;

    return {
      totalMembers: state.personnel.length,
      activeMembers,
      resignedMembers,
      deceasedMembers,
      newEntries,
      resignations,
      byRank,
      byOrganization,
      dateGenerated: now.toISOString(),
    };
  }, [state.personnel]);

  const handleExportCSV = () => {
    const csvContent = [
      ["ID", "Name", "Rank", "Date Joined", "Date Left", "Status", "Duties"],
      ...state.personnel.map((p) => [
        p.id,
        p.name,
        p.rank,
        new Date(p.dateOfJoining).toLocaleDateString(),
        p.dateOfLeaving ? new Date(p.dateOfLeaving).toLocaleDateString() : "",
        p.dateOfLeaving ? "Left" : "Active",
        p.assignedDuties.replace(/[",\n\r]/g, " "), // Clean for CSV
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personnel-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const rankEntries = Object.entries(report.byRank).sort(
    ([, a], [, b]) => b - a,
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
                <span className="text-white text-xl font-bold">✊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  Personnel Reports
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  PDF-Tech Personnel Management System
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportCSV}
              className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-6 h-6 text-myanmar-red" />
            <h2 className="text-xl font-semibold text-myanmar-black">
              Personnel Summary Report
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-myanmar-gray-dark">
            <Calendar className="w-4 h-4" />
            <span>
              Generated on {new Date(report.dateGenerated).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-myanmar-black mb-2">
                  {report.totalMembers}
                </div>
                <p className="text-sm text-myanmar-gray-dark">
                  Total Personnel Records
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Object.values(report.byRank).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-sm text-myanmar-gray-dark">
                  Active Personnel
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {report.newEntries}
                </div>
                <p className="text-sm text-myanmar-gray-dark">New This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {report.resignations}
                </div>
                <p className="text-sm text-myanmar-gray-dark">
                  Left This Month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personnel by Rank */}
        <Card className="border-myanmar-red/20 mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-myanmar-black">
              Active Personnel by Rank
            </h3>
          </CardHeader>
          <CardContent>
            {rankEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-myanmar-gray-dark">
                  No active personnel records found.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankEntries.map(([rank, count]) => {
                    const total = Object.values(report.byRank).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <TableRow key={rank}>
                        <TableCell>
                          <Badge variant="secondary">{rank}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{count}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-myanmar-red h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-myanmar-gray-dark w-12">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card className="border-myanmar-red/20">
          <CardHeader>
            <h3 className="text-lg font-semibold text-myanmar-black">
              Monthly Activity Summary
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">New Joinings</p>
                  <p className="text-sm text-green-600">This month</p>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {report.newEntries}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-800">Departures</p>
                  <p className="text-sm text-orange-600">This month</p>
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {report.resignations}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">Net Change</p>
                  <p className="text-sm text-blue-600">This month</p>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  +{report.newEntries - report.resignations}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
