import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DatabaseStatus } from "./DatabaseStatus";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Home,
  Users,
  UserPlus,
  List,
  Building2,
  Award,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  labelMyanmar: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

interface SideNavigationProps {
  onLogout?: () => void;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const t = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems: NavItem[] = [
    {
      label: "Dashboard",
      labelMyanmar: "မူလစာမျက်နှာ",
      icon: Home,
      href: "/dashboard",
    },
    {
      label: "Personnel Management",
      labelMyanmar: "ဝန်ထမ်းစီမံခန့်ခွဲမှု",
      icon: Users,
      children: [
        {
          label: "Personnel List",
          labelMyanmar: "ဝန်ထ��်းစာရင်း",
          icon: List,
          href: "/personnel-list",
        },
        {
          label: "Add Personnel",
          labelMyanmar: "ဝန်ထမ်းအသစ်ထည့်ရန်",
          icon: UserPlus,
          href: "/add-personnel",
        },
      ],
    },
    {
      label: "Organization",
      labelMyanmar: "အဖွဲ့အစည်း",
      icon: Building2,
      children: [
        {
          label: "Departments",
          labelMyanmar: "ဌာနများ",
          icon: Building2,
          href: "/department-management",
        },
        {
          label: "Positions",
          labelMyanmar: "ရာထူးများ",
          icon: Award,
          href: "/position-management",
        },
      ],
    },
    {
      label: "Attendance & Leave",
      labelMyanmar: "လက်ရှိမှုနှင့်လပ်ရက်",
      icon: Clock,
      children: [
        {
          label: "Attendance System",
          labelMyanmar: "လက်ရှိမှုစနစ်",
          icon: Clock,
          href: "/attendance",
        },
        {
          label: "Leave Management",
          labelMyanmar: "လပ်ရက်စီမံခန့်ခွဲမ���ု",
          icon: Calendar,
          href: "/leave-management",
          badge: 5,
        },
      ],
    },
    {
      label: "Performance",
      labelMyanmar: "စွမ်းရည်",
      icon: BarChart3,
      href: "/performance",
      badge: 3,
    },
    {
      label: "Financial",
      labelMyanmar: "ငွေကြေးရေးရာ",
      icon: DollarSign,
      children: [
        {
          label: "Financial Management",
          labelMyanmar: "ငွေကြေးစီမံခန့်ခွဲမှု",
          icon: DollarSign,
          href: "/financial-management",
        },
        {
          label: "Income Categories",
          labelMyanmar: "ဝင်ငွေအမျိုးအစားများ",
          icon: Settings,
          href: "/income-category-settings",
        },
      ],
    },
    {
      label: "Reports",
      labelMyanmar: "အစီရင်ခံစာများ",
      icon: FileText,
      href: "/reports",
    },
    {
      label: "Settings",
      labelMyanmar: "ဆက်တင်များ",
      icon: Settings,
      children: [
        {
          label: "Admin Settings",
          labelMyanmar: "အက်ဒမင်ဆက်တင်မျာ��",
          icon: Settings,
          href: "/admin-settings",
        },
      ],
    },
  ];

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => location.pathname === href;

  const getLabel = (item: NavItem) =>
    currentLanguage === "mm" ? item.labelMyanmar : item.label;

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.label)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-auto p-3 rounded-lg transition-all duration-200 hover:bg-myanmar-red/10 ${
                depth > 0 ? "ml-4" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-myanmar-red" />
                  {!isCollapsed && (
                    <span className="text-myanmar-black font-medium">
                      {getLabel(item)}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge className="bg-myanmar-red text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-myanmar-red" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-myanmar-red" />
                    )}
                  </div>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const navButton = (
      <Button
        variant="ghost"
        className={`w-full justify-start text-left h-auto p-3 rounded-lg transition-all duration-200 ${
          active
            ? "bg-myanmar-red text-white hover:bg-myanmar-red-dark"
            : "hover:bg-myanmar-red/10"
        } ${depth > 0 ? "ml-4" : ""}`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <item.icon
              className={`w-5 h-5 ${active ? "text-white" : "text-myanmar-red"}`}
            />
            {!isCollapsed && (
              <span
                className={`font-medium ${
                  active ? "text-white" : "text-myanmar-black"
                }`}
              >
                {getLabel(item)}
              </span>
            )}
          </div>
          {!isCollapsed && item.badge && (
            <Badge
              className={`text-xs ${
                active
                  ? "bg-white text-myanmar-red"
                  : "bg-myanmar-red text-white"
              }`}
            >
              {item.badge}
            </Badge>
          )}
        </div>
      </Button>
    );

    if (item.href) {
      return (
        <TooltipProvider key={item.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={item.href}>{navButton}</Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{getLabel(item)}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    }

    return navButton;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-myanmar-red/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-myanmar-red rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">✊</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-myanmar-black">
                  PDF-Tech
                </h1>
                <p className="text-xs text-myanmar-gray-dark">HR System</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex text-myanmar-red hover:bg-myanmar-red/10"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-myanmar-red/20 space-y-3">
        {!isCollapsed && (
          <>
            <DatabaseStatus />
            <LanguageSwitcher />
          </>
        )}

        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-myanmar-red" />
              <span className="text-sm text-myanmar-gray-dark">
                8 notifications
              </span>
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  {!isCollapsed && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col bg-white border-r border-myanmar-red/20 shadow-lg transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-80"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-myanmar-red/20"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-myanmar-red" />
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-myanmar-red/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-myanmar-red rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">✊</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-myanmar-black">
                    PDF-Tech
                  </h1>
                  <p className="text-xs text-myanmar-gray-dark">HR System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="text-myanmar-red hover:bg-myanmar-red/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => renderNavItem(item))}
              </nav>
            </div>
            <div className="p-4 border-t border-myanmar-red/20 space-y-3">
              <DatabaseStatus />
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SideNavigation;
