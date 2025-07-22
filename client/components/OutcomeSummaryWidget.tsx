import React, { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, ArrowRight, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../shared/income-system";
import { OutcomeCategory } from "../pages/OutcomeCategorySettings";

interface OutcomeSummaryWidgetProps {
  className?: string;
}

interface OutcomeCategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export const OutcomeSummaryWidget: React.FC<OutcomeSummaryWidgetProps> = ({
  className = "",
}) => {
  const [outcomeData, setOutcomeData] = useState<{
    totalOutcomes: number;
    categoryBreakdown: OutcomeCategoryData[];
    monthlyGrowth: number;
    pendingRecords: number;
    topCategories: OutcomeCategoryData[];
  }>({
    totalOutcomes: 0,
    categoryBreakdown: [],
    monthlyGrowth: 0,
    pendingRecords: 0,
    topCategories: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading outcome data
    const loadOutcomeData = async () => {
      try {
        // In real app, this would fetch from IncomeRecordService with type="outcome"
        const mockTopCategories = [
          {
            category: "Office Supplies",
            amount: 1200000,
            count: 5,
            percentage: 35.3,
          },
          {
            category: "Utilities",
            amount: 800000,
            count: 3,
            percentage: 23.5,
          },
          {
            category: "Transportation",
            amount: 600000,
            count: 4,
            percentage: 17.6,
          },
          {
            category: "Maintenance",
            amount: 400000,
            count: 2,
            percentage: 11.8,
          },
          {
            category: "Training",
            amount: 400000,
            count: 2,
            percentage: 11.8,
          },
        ];

        const totalOutcomes = mockTopCategories.reduce(
          (sum, cat) => sum + cat.amount,
          0,
        );

        const mockData = {
          totalOutcomes,
          categoryBreakdown: mockTopCategories,
          monthlyGrowth: -8.2, // Negative growth is good for outcomes
          pendingRecords: 2,
          topCategories: mockTopCategories.slice(0, 3), // Top 3 categories
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setOutcomeData(mockData);
      } catch (error) {
        console.error("Failed to load outcome data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOutcomeData();
  }, []);

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5" />
            Outcome Summary
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
            <MinusCircle className="h-5 w-5 text-red-600" />
            Outcome Summary
          </CardTitle>
          <Link to="/financial-management">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Outcomes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Outcomes</span>
            <div className="flex items-center gap-2">
              {outcomeData.monthlyGrowth < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  outcomeData.monthlyGrowth < 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {outcomeData.monthlyGrowth > 0 ? "+" : ""}
                {outcomeData.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(outcomeData.totalOutcomes)}
          </p>
          <p className="text-xs text-gray-500 mt-1">စုစုပေါင်းထွက်ငွေ</p>
        </div>

        {/* Top Categories */}
        <div className="space-y-2">
          <span className="text-sm text-gray-600 font-medium">
            Top Outcome Categories
          </span>
          {outcomeData.topCategories.map((category, index) => (
            <div key={category.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {category.category}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-red-600 text-red-600 text-xs"
                  >
                    {category.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(category.amount)}
                </p>
                <span className="text-xs text-gray-500">
                  {category.count} records
                </span>
              </div>
              {index < outcomeData.topCategories.length - 1 && (
                <div className="border-b border-gray-100 mt-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Pending Records */}
        {outcomeData.pendingRecords > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600">Pending Approval</span>
              <Badge
                variant="outline"
                className="border-amber-600 text-amber-600"
              >
                {outcomeData.pendingRecords} records
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {outcomeData.pendingRecords} outcome records awaiting approval
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Link to="/financial-management">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <MinusCircle className="h-3 w-3" />
              Manage Outcome Records
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutcomeSummaryWidget;
