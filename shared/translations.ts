export interface TranslationData {
  // App Name and Branding
  appName: string;
  subtitle: string;

  // Authentication
  auth: {
    login: string;
    logout: string;
    username: string;
    password: string;
    signIn: string;
    invalidCredentials: string;
    loginRequired: string;
    secureAccess: string;
    monitoring: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    personnel: string;
    addPersonnel: string;
    editPersonnel: string;
    reports: string;
    settings: string;
    back: string;
    hrDashboard: string;
    attendance: string;
    leaveManagement: string;
    performance: string;
    payroll: string;
    training: string;
    positionManagement: string;
  };

  // Personnel Fields
  personnel: {
    id: string;
    name: string;
    rank: string;
    position: string;
    dateOfJoining: string;
    dateOfLeaving: string;
    assignedDuties: string;
    status: string;
    organization: string;
    department: string;
    totalPersonnel: string;
    activePersonnel: string;
    newThisMonth: string;
    leftThisMonth: string;
    personnelRecords: string;
    personnelManagement: string;
    addPersonnelRecord: string;
    editPersonnelRecord: string;
    personnelInformation: string;
    employeeNumber: string;
    email: string;
    phone: string;
    salary: string;
    manager: string;
    emergencyContact: string;
  };

  // HR System
  hr: {
    dashboard: string;
    analytics: string;
    metrics: string;
    overview: string;
    quickStats: string;
    attendance: string;
    leaves: string;
    performance: string;
    payroll: string;
    training: string;
    newHires: string;
    terminations: string;
    turnoverRate: string;
    averageAttendance: string;
    pendingApprovals: string;
    todayAttendance: string;
    clockIn: string;
    clockOut: string;
    break: string;
    overtime: string;
    totalHours: string;
    workingHours: string;
    lateArrivals: string;
    earlyDepartures: string;
    absentToday: string;
  };

  // Leave Management
  leave: {
    management: string;
    requests: string;
    balance: string;
    history: string;
    apply: string;
    approve: string;
    reject: string;
    pending: string;
    approved: string;
    rejected: string;
    cancelled: string;
    annual: string;
    sick: string;
    maternity: string;
    paternity: string;
    emergency: string;
    bereavement: string;
    startDate: string;
    endDate: string;
    reason: string;
    documents: string;
    totalDays: string;
    remainingDays: string;
  };

  // Position Management
  positions: {
    management: string;
    title: string;
    add: string;
    edit: string;
    delete: string;
    level: string;
    department: string;
    responsibilities: string;
    requirements: string;
    salaryRange: string;
    reportsTo: string;
    isActive: string;
    hierarchy: string;
    createPosition: string;
    editPosition: string;
    positionDetails: string;
    organizational: string;
    chart: string;
    structure: string;
  };

  // Status Options
  status: {
    active: string;
    inactive: string;
    resigned: string;
    deceased: string;
    left: string;
    terminated: string;
    onLeave: string;
    suspended: string;
    pending: string;
    inProgress: string;
    completed: string;
    overdue: string;
    cancelled: string;
  };

  // Ranks (Default Myanmar military ranks with English equivalents)
  ranks: {
    soldier: string;
    officer: string;
    responsible: string;
    corporal: string;
    sergeant: string;
    lieutenant: string;
    captain: string;
    major: string;
    colonel: string;
    general: string;
    // Additional civilian positions
    director: string;
    manager: string;
    supervisor: string;
    specialist: string;
    assistant: string;
    coordinator: string;
    analyst: string;
    engineer: string;
    technician: string;
    consultant: string;
  };

  // Organizations/Departments
  organizations: {
    headquarters: string;
    region: string;
    township: string;
    ward: string;
    village: string;
    technology: string;
    operations: string;
    intelligence: string;
    training: string;
    medical: string;
    administration: string;
    humanResources: string;
    finance: string;
    logistics: string;
    security: string;
  };

  // Actions
  actions: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    search: string;
    filter: string;
    export: string;
    generate: string;
    update: string;
    view: string;
    download: string;
    submit: string;
    approve: string;
    reject: string;
    upload: string;
    remove: string;
    create: string;
    manage: string;
    configure: string;
  };

  // Form Validation
  validation: {
    required: string;
    duplicateId: string;
    invalidDate: string;
    invalidEmail: string;
    invalidPhone: string;
    leavingBeforeJoining: string;
    idFormat: string;
    passwordLength: string;
    passwordMatch: string;
    numberOnly: string;
    positiveNumber: string;
  };

  // Messages
  messages: {
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    offlineMode: string;
    noRecordsFound: string;
    confirmDelete: string;
    confirmUpdate: string;
    dataLoaded: string;
    processingRequest: string;
    operationComplete: string;
    accessDenied: string;
  };

  // Reports
  reports: {
    title: string;
    summaryReport: string;
    detailedReport: string;
    generatedOn: string;
    totalMembers: string;
    activeMembers: string;
    resignedMembers: string;
    deceasedMembers: string;
    newEntries: string;
    monthlyActivity: string;
    byRank: string;
    byOrganization: string;
    byDepartment: string;
    exportCSV: string;
    exportPDF: string;
    exportExcel: string;
    attendanceReport: string;
    leaveReport: string;
    performanceReport: string;
    payrollReport: string;
  };

  // Settings
  settings: {
    title: string;
    ranks: string;
    organizations: string;
    departments: string;
    positions: string;
    manageRanks: string;
    manageOrganizations: string;
    manageDepartments: string;
    managePositions: string;
    addRank: string;
    addOrganization: string;
    addDepartment: string;
    addPosition: string;
    adminOnly: string;
    systemSettings: string;
    userPreferences: string;
    language: string;
    theme: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };

  // Search and Filter
  search: {
    placeholder: string;
    noResults: string;
    filterBy: string;
    allStatuses: string;
    allRanks: string;
    allOrganizations: string;
    allDepartments: string;
    allPositions: string;
    dateRange: string;
    sortBy: string;
    ascending: string;
    descending: string;
    clearFilters: string;
    advancedSearch: string;
  };

  // Common
  common: {
    loading: string;
    yes: string;
    no: string;
    optional: string;
    required: string;
    active: string;
    inactive: string;
    count: string;
    percentage: string;
    date: string;
    time: string;
    welcome: string;
    total: string;
    average: string;
    minimum: string;
    maximum: string;
    description: string;
    notes: string;
    attachments: string;
    history: string;
    details: string;
    summary: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Time and Date
  time: {
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    thisMonth: string;
    thisYear: string;
    lastWeek: string;
    lastMonth: string;
    lastYear: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    am: string;
    pm: string;
    hours: string;
    minutes: string;
    seconds: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
  };
}

// English translations (Primary Language)
export const englishTranslations: TranslationData = {
  // App Name and Branding
  appName: "PDF-Technology",
  subtitle: "People's Defense Force Technology Workshop",

  // Authentication
  auth: {
    login: "Login",
    logout: "Logout",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    invalidCredentials: "Invalid credentials",
    loginRequired: "Authentication required for access",
    secureAccess: "Secure access required",
    monitoring: "This system is monitored for security",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    personnel: "Personnel",
    addPersonnel: "Add Personnel",
    editPersonnel: "Edit Personnel",
    reports: "Reports",
    settings: "Settings",
    back: "Back",
    hrDashboard: "HR Dashboard",
    attendance: "Attendance",
    leaveManagement: "Leave Management",
    performance: "Performance",
    payroll: "Payroll",
    training: "Training",
    positionManagement: "Position Management",
  },

  // Personnel Fields
  personnel: {
    id: "Employee ID",
    name: "Full Name",
    rank: "Rank",
    position: "Position",
    dateOfJoining: "Date of Joining",
    dateOfLeaving: "Date of Leaving",
    assignedDuties: "Assigned Duties",
    status: "Status",
    organization: "Organization",
    department: "Department",
    totalPersonnel: "Total Personnel",
    activePersonnel: "Active Personnel",
    newThisMonth: "New This Month",
    leftThisMonth: "Left This Month",
    personnelRecords: "Personnel Records",
    personnelManagement: "Personnel Management",
    addPersonnelRecord: "Add Personnel Record",
    editPersonnelRecord: "Edit Personnel Record",
    personnelInformation: "Personnel Information",
    employeeNumber: "Employee Number",
    email: "Email Address",
    phone: "Phone Number",
    salary: "Salary",
    manager: "Manager",
    emergencyContact: "Emergency Contact",
  },

  // HR System
  hr: {
    dashboard: "HR Dashboard",
    analytics: "Analytics",
    metrics: "Metrics",
    overview: "Overview",
    quickStats: "Quick Statistics",
    attendance: "Attendance",
    leaves: "Leaves",
    performance: "Performance",
    payroll: "Payroll",
    training: "Training",
    newHires: "New Hires",
    terminations: "Terminations",
    turnoverRate: "Turnover Rate",
    averageAttendance: "Average Attendance",
    pendingApprovals: "Pending Approvals",
    todayAttendance: "Today's Attendance",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    break: "Break",
    overtime: "Overtime",
    totalHours: "Total Hours",
    workingHours: "Working Hours",
    lateArrivals: "Late Arrivals",
    earlyDepartures: "Early Departures",
    absentToday: "Absent Today",
  },

  // Leave Management
  leave: {
    management: "Leave Management",
    requests: "Leave Requests",
    balance: "Leave Balance",
    history: "Leave History",
    apply: "Apply for Leave",
    approve: "Approve",
    reject: "Reject",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    annual: "Annual Leave",
    sick: "Sick Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    emergency: "Emergency Leave",
    bereavement: "Bereavement Leave",
    startDate: "Start Date",
    endDate: "End Date",
    reason: "Reason",
    documents: "Documents",
    totalDays: "Total Days",
    remainingDays: "Remaining Days",
  },

  // Position Management
  positions: {
    management: "Position Management",
    title: "Position Title",
    add: "Add Position",
    edit: "Edit Position",
    delete: "Delete Position",
    level: "Level",
    department: "Department",
    responsibilities: "Responsibilities",
    requirements: "Requirements",
    salaryRange: "Salary Range",
    reportsTo: "Reports To",
    isActive: "Is Active",
    hierarchy: "Hierarchy",
    createPosition: "Create Position",
    editPosition: "Edit Position",
    positionDetails: "Position Details",
    organizational: "Organizational",
    chart: "Chart",
    structure: "Structure",
  },

  // Status Options
  status: {
    active: "Active",
    inactive: "Inactive",
    resigned: "Resigned",
    deceased: "Deceased",
    left: "Left",
    terminated: "Terminated",
    onLeave: "On Leave",
    suspended: "Suspended",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    overdue: "Overdue",
    cancelled: "Cancelled",
  },

  // Ranks
  ranks: {
    soldier: "Soldier",
    officer: "Officer",
    responsible: "Responsible",
    corporal: "Corporal",
    sergeant: "Sergeant",
    lieutenant: "Lieutenant",
    captain: "Captain",
    major: "Major",
    colonel: "Colonel",
    general: "General",
    director: "Director",
    manager: "Manager",
    supervisor: "Supervisor",
    specialist: "Specialist",
    assistant: "Assistant",
    coordinator: "Coordinator",
    analyst: "Analyst",
    engineer: "Engineer",
    technician: "Technician",
    consultant: "Consultant",
  },

  // Organizations
  organizations: {
    headquarters: "PDF Technology Workshop",
    region: "Region",
    township: "Township",
    ward: "Ward",
    village: "Village",
    technology: "Technology Workshop",
    operations: "Operations",
    intelligence: "Intelligence",
    training: "Training",
    medical: "Medical",
    administration: "Administration",
    humanResources: "Human Resources",
    finance: "Finance",
    logistics: "Logistics",
    security: "Security",
  },

  // Actions
  actions: {
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    export: "Export",
    generate: "Generate",
    update: "Update",
    view: "View",
    download: "Download",
    submit: "Submit",
    approve: "Approve",
    reject: "Reject",
    upload: "Upload",
    remove: "Remove",
    create: "Create",
    manage: "Manage",
    configure: "Configure",
  },

  // Form Validation
  validation: {
    required: "This field is required",
    duplicateId: "Duplicate ID entered",
    invalidDate: "Invalid date",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    leavingBeforeJoining: "Leaving date cannot be before joining date",
    idFormat: "ID must be in Pxxxxx format (e.g. P14034)",
    passwordLength: "Password must be at least 8 characters",
    passwordMatch: "Passwords do not match",
    numberOnly: "Only numbers allowed",
    positiveNumber: "Must be a positive number",
  },

  // Messages
  messages: {
    saved: "Record saved successfully",
    deleted: "Record deleted successfully",
    updated: "Record updated successfully",
    created: "Record created successfully",
    error: "An error occurred",
    success: "Operation successful",
    warning: "Warning",
    info: "Information",
    offlineMode: "Working in offline mode",
    noRecordsFound: "No records found",
    confirmDelete: "Are you sure you want to delete this record?",
    confirmUpdate: "Are you sure you want to update this record?",
    dataLoaded: "Data loaded successfully",
    processingRequest: "Processing request...",
    operationComplete: "Operation completed",
    accessDenied: "Access denied",
  },

  // Reports
  reports: {
    title: "Reports",
    summaryReport: "Summary Report",
    detailedReport: "Detailed Report",
    generatedOn: "Generated on",
    totalMembers: "Total Members",
    activeMembers: "Active Members",
    resignedMembers: "Resigned Members",
    deceasedMembers: "Deceased Members",
    newEntries: "New Entries",
    monthlyActivity: "Monthly Activity Summary",
    byRank: "By Rank",
    byOrganization: "By Organization",
    byDepartment: "By Department",
    exportCSV: "Export CSV",
    exportPDF: "Export PDF",
    exportExcel: "Export Excel",
    attendanceReport: "Attendance Report",
    leaveReport: "Leave Report",
    performanceReport: "Performance Report",
    payrollReport: "Payroll Report",
  },

  // Settings
  settings: {
    title: "Settings",
    ranks: "Ranks",
    organizations: "Organizations",
    departments: "Departments",
    positions: "Positions",
    manageRanks: "Manage Ranks",
    manageOrganizations: "Manage Organizations",
    manageDepartments: "Manage Departments",
    managePositions: "Manage Positions",
    addRank: "Add Rank",
    addOrganization: "Add Organization",
    addDepartment: "Add Department",
    addPosition: "Add Position",
    adminOnly: "Admin access only",
    systemSettings: "System Settings",
    userPreferences: "User Preferences",
    language: "Language",
    theme: "Theme",
    timezone: "Timezone",
    dateFormat: "Date Format",
    currency: "Currency",
  },

  // Search and Filter
  search: {
    placeholder: "Search by ID, name, or position...",
    noResults: "No results found matching your search",
    filterBy: "Filter by",
    allStatuses: "All Statuses",
    allRanks: "All Ranks",
    allOrganizations: "All Organizations",
    allDepartments: "All Departments",
    allPositions: "All Positions",
    dateRange: "Date Range",
    sortBy: "Sort by",
    ascending: "Ascending",
    descending: "Descending",
    clearFilters: "Clear Filters",
    advancedSearch: "Advanced Search",
  },

  // Common
  common: {
    loading: "Loading...",
    yes: "Yes",
    no: "No",
    optional: "Optional",
    required: "Required",
    active: "Active",
    inactive: "Inactive",
    count: "Count",
    percentage: "Percentage",
    date: "Date",
    time: "Time",
    welcome: "Welcome",
    total: "Total",
    average: "Average",
    minimum: "Minimum",
    maximum: "Maximum",
    description: "Description",
    notes: "Notes",
    attachments: "Attachments",
    history: "History",
    details: "Details",
    summary: "Summary",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    city: "City",
    state: "State",
    country: "Country",
    postalCode: "Postal Code",
  },

  // Time and Date
  time: {
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastYear: "Last Year",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    am: "AM",
    pm: "PM",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    days: "Days",
    weeks: "Weeks",
    months: "Months",
    years: "Years",
  },
};

// Burmese translations (Secondary Language)
export const myanmarTranslations: TranslationData = {
  // App Name and Branding
  appName: "ပကဖ-နည်းပညာ",
  subtitle: "ပြည်သူ့ကာကွယ်ရေးတပ်ဖွဲ့ နည်းပညာလက်ရုံးတပ်",

  // Authentication
  auth: {
    login: "ဝင်ရောက်ရန်",
    logout: "ထွက်ရန်",
    username: "အသုံးပြုသူအမည်",
    password: "စကားဝှက်",
    signIn: "ဝင်ရောက်ရန်",
    invalidCredentials: "မှားယွင်းသော အထောက်အထားများ",
    loginRequired: "အခွင့်အရေးရသူများသာ ဝင်ရောက်နိုင်ပါသည်",
    secureAccess: "လုံခြုံသော ဝင်ရောက်ခွင့် လိုအပ်သည်",
    monitoring: "ဤစနစ်ကို ကြီးကြပ်စောင့်ကြပ်ထားပါသည်",
  },

  // Navigation
  nav: {
    dashboard: "မျက်နှ��ပြင်",
    personnel: "ဝန်ထမ်းများ",
    addPersonnel: "ဝန်ထမ်းအသစ်ထည့်ရန်",
    editPersonnel: "ဝန်ထမ်းပြင်ဆင်ရန်",
    reports: "အစီရင်ခံစာများ",
    settings: "ဆက်တင်များ",
    back: "နောက်သို့",
    hrDashboard: "HR မျက်နှာပြင်",
    attendance: "တက်ရောက်မှုစနစ်",
    leaveManagement: "ခွင့်ရက်စီမံခန့်ခွဲမှု",
    performance: "စွမ်းဆောင်ရည်",
    payroll: "လစာစနစ်",
    training: "လေ့ကျင့်မှု",
    positionManagement: "ရာထူးစီမံခန့်ခွဲမှု",
  },

  // Personnel Fields
  personnel: {
    id: "ဝန်ထမ်းကုဒ်",
    name: "အမည်အပြည့်အစုံ",
    rank: "ရာထူး",
    position: "ရာထားး",
    dateOfJoining: "ဝင်ရောက်ခဲ့သည့်ရက်",
    dateOfLeaving: "ထွက်ခွာသည့်ရက်",
    assignedDuties: "တာဝန်ကျေးများ",
    status: "အခြေအနေ",
    organization: "အဖွဲ့အစည်း",
    department: "ဌာနခွဲ",
    totalPersonnel: "စုစုပေါင်း ဝန်ထမ်းများ",
    activePersonnel: "လက်ရှိ ဝန်ထမ်းများ",
    newThisMonth: "ဤလအတွင်း အသစ်ဝင်",
    leftThisMonth: "ဤလအတွင်း ထွက်ခွာ",
    personnelRecords: "ဝန်ထမ်းမှတ်တမ်းများ",
    personnelManagement: "ဝန်ထမ်းစီမံခန့်ခွဲမှု",
    addPersonnelRecord: "ဝန်ထမ်းမှတ်တမ်းအသစ်",
    editPersonnelRecord: "ဝန်ထမ်းမှတ်တမ်းပြင်ဆင်",
    personnelInformation: "ဝန်ထမ်းအချက်အလက်များ",
    employeeNumber: "ဝန်ထမ်းနံပါတ်",
    email: "အီးမေးလ်လိပ်စာ",
    phone: "ဖုန်းနံပါတ်",
    salary: "လစာ",
    manager: "မန်နေဂျာ",
    emergencyContact: "အရေးပေါ်ဆက်သွယ်ရန်",
  },

  // HR System
  hr: {
    dashboard: "HR မျက်နှာပြင်",
    analytics: "ခွဲခြမ်းစိတ်ဖြာမ���ု",
    metrics: "တိုင်းတာမှုများ",
    overview: "ခြုံငုံသုံးမျက်နှာ",
    quickStats: "လျင်မြန်စာရင်းအင်း",
    attendance: "တက်ရောက်မှု",
    leaves: "ခွင့်ရက်များ",
    performance: "စွမ်းဆောင်ရည်",
    payroll: "လစာစနစ်",
    training: "လေ့ကျင့်မှု",
    newHires: "အသစ်ဝင်ရောက်သူများ",
    terminations: "ထွက်ခွာသူများ",
    turnoverRate: "ဝန်ထမ်းပြောင်းလဲမှုနှုန်း",
    averageAttendance: "ပျမ်းမျှတက်ရောက်မှု",
    pendingApprovals: "ခွင့်ပြုချက်စောင့်ရှောက်မှုများ",
    todayAttendance: "ယနေ့တက်ရောက်မှု",
    clockIn: "အလုပ်ဝင်ချိန်",
    clockOut: "အလုပ်ထွက်ချိန်",
    break: "နားချိန်",
    overtime: "အပိုချိန်လုပ်ငန်း",
    totalHours: "စုစုပေါင်းနာရီ",
    workingHours: "အလ��ပ်လုပ်ချိန်",
    lateArrivals: "နောက်ကျရောက်ရှိမှု",
    earlyDepartures: "စောစီးထွက်ခွာမှု",
    absentToday: "ယနေ့မတက်ရောက်သူများ",
  },

  // Leave Management
  leave: {
    management: "ခွင့်ရက်စီမံခန့်ခွဲမှု",
    requests: "ခွင့်ရက်တောင်းခံမှုများ",
    balance: "ခွင့်ရက်လက်ကျန်",
    history: "ခွင့်ရက်မှတ်တမ်း",
    apply: "ခွင့်တောင်းရန်",
    approve: "ခွင့်ပြုရန်",
    reject: "ပယ်ချရန်",
    pending: "စောင့်ဆိုင်းနေ",
    approved: "ခွင့်ပြုပြီး",
    rejected: "ပယ်ချပြီး",
    cancelled: "ပယ်ဖျက်ပြီး",
    annual: "နှစ်ပတ်လပ်ရက်",
    sick: "ဖျားနာလပ်ရက်",
    maternity: "မီးဖွားလပ်ရက်",
    paternity: "ဖခင်လပ်ရက်",
    emergency: "အရေးပေါ်လပ်ရက်",
    bereavement: "ဆွေမျိုးသေ���ုံးလပ်ရက်",
    startDate: "စတင်ရက်",
    endDate: "ပြီးဆုံးရက်",
    reason: "အကြောင်းအရင်း",
    documents: "စာရွက်စာတမ်းများ",
    totalDays: "စုစုပေါင်းရက်",
    remainingDays: "ကျန်ရှိနေသောရက်",
  },

  // Position Management
  positions: {
    management: "ရာထူးစီမံခန့်ခွဲမှု",
    title: "ရာထူးခေါင်းစဉ်",
    add: "ရာထူးထည့်ရန်",
    edit: "ရာထူးပြင်ရန်",
    delete: "ရာထူးဖျက်ရန်",
    level: "အဆင့်",
    department: "ဌာနခွဲ",
    responsibilities: "တာဝန်များ",
    requirements: "လိုအပ်ချက်များ",
    salaryRange: "လစာအပိုင်းအခြား",
    reportsTo: "ခေါင်းငုံရမည့်သူ",
    isActive: "အသုံးပြုနေသည်",
    hierarchy: "အဆင့်အသိုင်း",
    createPosition: "ရာထူးဖန်တီးရန်",
    editPosition: "ရာထူးပြင်ဆင်ရန်",
    positionDetails: "ရာထူးအသေးစိတ်",
    organizational: "အဖွဲ့အစည်းဆိုင်ရာ",
    chart: "ဇယား",
    structure: "ဖွဲ့စည်းပုံ",
  },

  // Status Options
  status: {
    active: "ဆက်ရှိနေသူ",
    inactive: "မလက်ရှိ",
    resigned: "နှုတ်ထွက်သူ",
    deceased: "ကျဆုံးသူ",
    left: "ထွက်ခွာ",
    terminated: "ရာထူးမှထုတ်ပယ်",
    onLeave: "ခွင့်ရက်ယူနေ",
    suspended: "ရပ်ဆိုင်း",
    pending: "စောင့်ဆိုင်းနေ",
    inProgress: "လုပ်ဆောင်နေ",
    completed: "ပြီးစီး",
    overdue: "နောက်ကျ",
    cancelled: "ပယ်ဖျက်",
  },

  // Ranks
  ranks: {
    soldier: "တပ်သား",
    officer: "အရာရှိ",
    responsible: "တာဝန်ခံ",
    corporal: "တပ်ကြပ်",
    sergeant: "တပ်ကြပ်ကြီး",
    lieutenant: "ဒုတပ်မှူး",
    captain: "တပ်မှူး",
    major: "ဗိုလ်မှူးကြီး",
    colonel: "ဗိုလ်မှူးခ��ုပ်",
    general: "ဗိုလ်ချုပ်",
    director: "ဒါရိုက်တာ",
    manager: "မန်နေဂျာ",
    supervisor: "ကြီးကြပ်ရေးမှူး",
    specialist: "ကျွမ်းကျင်သူ",
    assistant: "လက်ထောက်",
    coordinator: "ညှိနှိုင်းပေးသူ",
    analyst: "ခွဲခြမ်းစိတ်ဖြာသူ",
    engineer: "အင်ဂျင်နီယာ",
    technician: "နည်းပညာရှင်",
    consultant: "အကြံပေးပုဂ္ဂိုလ်",
  },

  // Organizations
  organizations: {
    headquarters: "ပကဖ နည်းပညာလက်ရုံးတပ်",
    region: "တိုင်း",
    township: "မြို့နယ်",
    ward: "တိုက်နယ်",
    village: "ရပ်ကျေး",
    technology: "နည်းပညာလက်ရုံးတပ်",
    operations: "စစ်ဆင်ရေး",
    intelligence: "ထောက်လှမ်းရေး",
    training: "လေ့ကျင့်ရေး",
    medical: "ဆေးဝါးရေး",
    administration: "အုပ်ချုပ်ရေး",
    humanResources: "လူ့အရင်��အမြစ်",
    finance: "ဘာဝင်ရေး",
    logistics: "ထောက်ပံ့ရေး",
    security: "လုံခြုံရေး",
  },

  // Actions
  actions: {
    add: "ထည့်ရန်",
    edit: "ပြင်ရန်",
    delete: "ဖျက်ရန်",
    save: "သိမ်းရန်",
    cancel: "ပယ်ဖျက်ရန်",
    search: "ရှာဖွေရန်",
    filter: "စစ်ထုတ်ရန်",
    export: "ထုတ်ယူရန်",
    generate: "ထုတ်လုပ်ရန်",
    update: "အပ်ဒိတ်လုပ်ရန်",
    view: "ကြည့်ရှုရန်",
    download: "ဒေါင်းလုဒ်လုပ်ရန်",
    submit: "တင်သွင်းရန်",
    approve: "ခွင့်ပြုရန်",
    reject: "ပယ်ချရန်",
    upload: "တင်ရန်",
    remove: "ဖယ်ရှားရန်",
    create: "ဖန်တီးရန်",
    manage: "စီမံခန့်ခွဲရန်",
    configure: "ပြင်ဆင်ရန်",
  },

  // Form Validation
  validation: {
    required: "ဤအချက်အလက် ဖြည့်စွက်ရန် လိုအပ်သည်",
    duplicateId: "ထပ်နေသော ID ထည့်သွင်းထားသည်",
    invalidDate: "မှားယွင်းသော ရက်စွဲ",
    invalidEmail: "မှားယွင်းသော အီးမေးလ်လိပ���စာ",
    invalidPhone: "မှားယွင်းသော ဖုန်းနံပါတ်",
    leavingBeforeJoining: "ထွက်ခွာသည့်ရက်သည် ဝင်ရောက်သည့်ရက်ထက် မစောနိုင်ပါ",
    idFormat: "ID သည် Pxxxxx ပုံစံဖြင့် ဖြစ်ရမည် (ဥပမာ: P14034)",
    passwordLength: "စကားဝှက်သည် အနည်းဆုံး ၈ လုံးရှိရမည်",
    passwordMatch: "စကားဝှက်များ မတူညီပါ",
    numberOnly: "ကိန်းဂဏန်းများသာ ရေးရန်",
    positiveNumber: "အပြုသဘော ကိန်းဂဏန်းဖြစ်ရမည်",
  },

  // Messages
  messages: {
    saved: "မှတ်တမ်းအောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ",
    deleted: "မှတ်တမ်းဖျက်သိမ်းပြီးပါပြီ",
    updated: "မှတ်တမ်းအပ်ဒိတ်လုပ်ပြီးပါပြီ",
    created: "မှတ်တမ်းအောင်မြင်စွာ ဖန်တီးပြီးပါပြီ",
    error: "အမှားတစ���ခုဖြစ်ပေါ်ခဲ့သည်",
    success: "အောင်မြင်စွာ ပြီးဆုံးပါပြီ",
    warning: "သတိပေးချက်",
    info: "အချက်အလက်",
    offlineMode: "အော့ဖ်လိုင်းမုဒ်တွင် အလုပ်လုပ်နေသည်",
    noRecordsFound: "မှတ်တမ်းမတွေ့ရှိပါ",
    confirmDelete: "ဤမှတ်တမ်းကို ဖျက်သိမ်းလိုသည်မှာ သေချာပါသလား?",
    confirmUpdate: "ဤမှတ်တမ်းကို အပ်ဒိတ်လုပ်လိုသည်မှာ သေချာပါသလား?",
    dataLoaded: "အချက်အလက်များ အောင်မြင်စွာ ထည့်သွင်းပြီး",
    processingRequest: "တောင်းခံမှုကို လုပ်ဆောင်နေသည်...",
    operationComplete: "လုပ်ငန်း ပြီးဆုံးပါပြီ",
    accessDenied: "ဝင်ရောက်ခွင့် မရှိပါ",
  },

  // Reports
  reports: {
    title: "အစီရင်ခံစာများ",
    summaryReport: "အနှစ်ချုပ်��စီရင်ခံစာ",
    detailedReport: "အသေးစိတ်အစီရင်ခံစာ",
    generatedOn: "ထုတ်လုပ်သည့်ရက်",
    totalMembers: "စုစုပေါင်း အဖွဲ့ဝင်များ",
    activeMembers: "လက်ရှိ အဖွဲ့ဝင်များ",
    resignedMembers: "နှုတ်ထွက်သူများ",
    deceasedMembers: "ကျဆုံးသူများ",
    newEntries: "အသစ်ဝင်များ",
    monthlyActivity: "လစဉ် လှုပ်ရှားမှုအနှစ်ချုပ်",
    byRank: "ရာထူးအလိုက်",
    byOrganization: "အဖွဲ့အစည်းအလိုက်",
    byDepartment: "ဌာနခွဲအလိုက်",
    exportCSV: "CSV ထုတ်ယူရန်",
    exportPDF: "PDF ထုတ်ယူရန်",
    exportExcel: "Excel ထုတ်ယူရန်",
    attendanceReport: "တက်ရောက်မှုအစီရင်ခံစာ",
    leaveReport: "ခွင့်ရက်အစီရင်ခံစာ",
    performanceReport: "စွမ်းဆောင်ရည်အစီရင်ခံစာ",
    payrollReport: "လစာစနစ်အစီရင်ခံစ���",
  },

  // Settings
  settings: {
    title: "ဆက်တင်များ",
    ranks: "ရာထူးများ",
    organizations: "အဖွဲ့အစည်းများ",
    departments: "ဌာနခွဲများ",
    positions: "ရာထားးများ",
    manageRanks: "ရာထူးများ စီမံခန့်ခွဲရန်",
    manageOrganizations: "အဖွဲ့အစည်းများ စီမံခန့်ခွဲရန်",
    manageDepartments: "ဌာနခွဲများ စီမံခန့်ခွဲရန်",
    managePositions: "ရာထားးများ စီမံခန့်ခွဲရန်",
    addRank: "ရာထူးအသစ် ထည့်ရန်",
    addOrganization: "အဖွဲ့အစည်းအသစ် ထည့်ရန်",
    addDepartment: "ဌာနခွဲအသစ် ထည့်ရန်",
    addPosition: "ရာထားးအသစ် ထည့်ရန်",
    adminOnly: "စီမံခန့်ခွဲသူများသာ ဝင်ရောက်နိုင်သည်",
    systemSettings: "စနစ်ဆက်တင်များ",
    userPreferences: "အသုံးပြုသူရွေးချယ်မှုများ",
    language: "ဘာသာစကား",
    theme: "အပြင်အဆင်",
    timezone: "အချိန်ဇုန်",
    dateFormat: "ရက်စွဲပုံစံ",
    currency: "ငွေကြေး",
  },

  // Search and Filter
  search: {
    placeholder: "ID၊ အမည်၊ သို့မဟုတ် ရာထူးဖြင့် ရှာဖွေရန်...",
    noResults: "ရှာဖွေမှုနှင့် ကိုက်ညီသော ရလဒ်များ မတွေ့ရှိပါ",
    filterBy: "စစ်ထုတ်ရန်",
    allStatuses: "အခြေအနေအားလုံး",
    allRanks: "ရာထူးအားလုံး",
    allOrganizations: "အဖွဲ့အစည်းအားလုံး",
    allDepartments: "ဌာနခွဲအားလုံး",
    allPositions: "ရာထားးအားလုံး",
    dateRange: "ရက်စွဲအပိုင်းအခြား",
    sortBy: "အစီအစဉ်ပြင်ရန်",
    ascending: "တက်လာသည်",
    descending: "ကျဆင်းသည်",
    clearFilters: "စစ်ထုတ်မှုများ ရှင်းလင်းရန်",
    advancedSearch: "အဆင့်မြင့်ရှ���ဖွေမှု",
  },

  // Common
  common: {
    loading: "ဆောင်ရွက်နေပါသည်...",
    yes: "ဟုတ်ကဲ့",
    no: "မဟုတ်ပါ",
    optional: "မဖြည့်စွက်လည်းရသည်",
    required: "လိုအပ်သည်",
    active: "လက်ရှိ",
    inactive: "မလက်ရှိ",
    count: "အရေအတွက်",
    percentage: "ရာခိုင်နှုန်း",
    date: "ရက်စွဲ",
    time: "အချိန်",
    welcome: "ကြိုဆိုပါသည်",
    total: "စုစုပေါင်း",
    average: "ပျမ်းမျှ",
    minimum: "အနည်းဆုံး",
    maximum: "အများဆုံး",
    description: "ဖော်ပြချက်",
    notes: "မှတ်ချက်များ",
    attachments: "ပူးတွဲစာရွက်များ",
    history: "မှတ်တမ်း",
    details: "အသေးစိတ်",
    summary: "အနှစ်ချုပ်",
    name: "အမည်",
    email: "အီးမေးလ်",
    phone: "ဖုန်း",
    address: "လိပ်စာ",
    city: "မြို့",
    state: "ပြည်နယ��",
    country: "နိုင်ငံ",
    postalCode: "စာတိုက်ကုဒ်",
  },

  // Time and Date
  time: {
    today: "ယနေ့",
    yesterday: "မနေ့က",
    tomorrow: "မနက်ဖြန်",
    thisWeek: "ဤအပတ်",
    thisMonth: "ဤလ",
    thisYear: "ဤနှစ်",
    lastWeek: "ပြီးခဲ့သည့်အပတ်",
    lastMonth: "ပြီးခဲ့သည့်လ",
    lastYear: "ပြီးခဲ့သည့်နှစ်",
    morning: "မနက်",
    afternoon: "နေ့လယ်",
    evening: "ညနေ",
    night: "ညဘက်",
    am: "နံနက်",
    pm: "ညနေ",
    hours: "နာရီ",
    minutes: "မိနစ်",
    seconds: "စက္ကန့်",
    days: "ရက်",
    weeks: "အပတ်",
    months: "လ",
    years: "နှစ်",
  },
};

// Language support type
export type SupportedLanguage = "en" | "mm";

// Default languages
export const defaultLanguage: SupportedLanguage = "en";
export const supportedLanguages: SupportedLanguage[] = ["en", "mm"];

// Translation getter function
export function getTranslations(
  language: SupportedLanguage = defaultLanguage,
): TranslationData {
  switch (language) {
    case "mm":
      return myanmarTranslations;
    case "en":
    default:
      return englishTranslations;
  }
}

// Legacy support for existing code
export const translations = englishTranslations;
export type TranslationKey = keyof TranslationData;
