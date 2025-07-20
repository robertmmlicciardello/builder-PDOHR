import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Link } from "react-router-dom";
import {
  IncomeRecord,
  calculateTotalIncome,
  groupIncomeByType,
  formatCurrency,
} from "../../shared/income-system";

interface IncomeSummaryWidgetProps {
  className?: string;
}

export const IncomeSummaryWidget: React.FC<IncomeSummaryWidgetProps> = ({
  className = "",
}) => {
  // Sample data - in real app, this would come from the income database
  const [incomeData, setIncomeData] = useState<{
    totalIncome: number;
    taxIncome: number;
    donationIncome: number;
    taxPercentage: number;
    donationPercentage: number;
    monthlyGrowth: number;
    pendingRecords: number;
  }>({
    totalIncome: 0,
    taxIncome: 0,
    donationIncome: 0,
    taxPercentage: 0,
    donationPercentage: 0,
    monthlyGrowth: 0,
    pendingRecords: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading income data
    const loadIncomeData = async () => {
      try {
        // In real app, this would fetch from IncomeRecordService
        const mockData = {
          totalIncome: 8500000,
          taxIncome: 6500000,
          donationIncome: 2000000,
          taxPercentage: 76.5,
          donationPercentage: 23.5,
          monthlyGrowth: 12.5,
          pendingRecords: 3,
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIncomeData(mockData);
      } catch (error) {
        console.error("Failed to load income data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIncomeData();
  }, []);

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Income Summary
          </CardTitle>
          <Link to="/income-management">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Income */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Income</span>
            <div className="flex items-center gap-2">
              {incomeData.monthlyGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  incomeData.monthlyGrowth > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {incomeData.monthlyGrowth > 0 ? "+" : ""}
                {incomeData.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(incomeData.totalIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">စုစုပေါင်းဝင်ငွေ</p>
        </div>

        {/* Tax Income */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tax Income</span>
            <Badge variant="default" className="bg-blue-600">
              {incomeData.taxPercentage.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-lg font-semibold text-blue-600">
            {formatCurrency(incomeData.taxIncome)}
          </p>
          <p className="text-xs text-gray-500">အခွန်ဝင်ငွေ</p>
          <Progress
            value={incomeData.taxPercentage}
            className="mt-2 h-2"
            // className="bg-blue-100"
          />
        </div>

        {/* Donation Income */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Donation Income</span>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              {incomeData.donationPercentage.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-lg font-semibold text-purple-600">
            {formatCurrency(incomeData.donationIncome)}
          </p>
          <p className="text-xs text-gray-500">အလှူဝင်ငွေ</p>
          <Progress
            value={incomeData.donationPercentage}
            className="mt-2 h-2"
            // className="bg-purple-100"
          />
        </div>

        {/* Pending Records */}
        {incomeData.pendingRecords > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600">Pending Approval</span>
              <Badge
                variant="outline"
                className="border-amber-600 text-amber-600"
              >
                {incomeData.pendingRecords} records
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {incomeData.pendingRecords} income records awaiting approval
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Link to="/income-management">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <DollarSign className="h-3 w-3" />
              Manage Income Records
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSummaryWidget;
