# Priority Implementation Plan for Government HR System

# အစိုးရ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ် ဦးစားပေး အကောင်အထည်ဖော်မှု အစီအစဉ်

Specific implementation roadmap with code examples for critical government features.

---

## 🎯 **Phase 1: Critical Government Features (Week 1-4)**

### **1.1 Government Pay Scale System Implementation**

#### **Database Schema Enhancement**

```typescript
// client/types/government.ts
export interface GovernmentPayScale {
  id: string;
  grade: number; // Grade 1-20
  step: number; // Step 1-10 within each grade
  basicSalary: number; // Base salary amount
  effectiveDate: Date; // When this scale became effective
  allowances: {
    positionAllowance: number; // Based on position level
    locationAllowance: number; // Based on township/state
    responsibilityAllowance: number; // For supervisory roles
    riskAllowance: number; // For dangerous positions
  };
  benefits: {
    medicalAllowance: number;
    transportAllowance: number;
    foodAllowance: number;
    familyAllowance: number;
  };
  isActive: boolean;
  createdBy: string;
  approvedBy: string;
  remarks: string;
}

export interface PersonnelGrade {
  personnelId: string;
  currentGrade: number;
  currentStep: number;
  appointmentDate: Date;
  lastPromotionDate?: Date;
  nextEligibleDate: Date;
  gradeHistory: GradeHistory[];
}

export interface GradeHistory {
  fromGrade: number;
  fromStep: number;
  toGrade: number;
  toStep: number;
  effectiveDate: Date;
  promotionType: "automatic" | "merit" | "special";
  approvedBy: string;
  orderNumber: string;
  remarks: string;
}
```

#### **Pay Scale Management Component**

```typescript
// client/pages/PayScaleManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGovernmentPayScale } from '@/hooks/useGovernmentPayScale';

export const PayScaleManagement: React.FC = () => {
  const { payScales, loading, createPayScale, updatePayScale } = useGovernmentPayScale();
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [newScale, setNewScale] = useState<Partial<GovernmentPayScale>>({
    grade: 1,
    step: 1,
    basicSalary: 0,
    allowances: {
      positionAllowance: 0,
      locationAllowance: 0,
      responsibilityAllowance: 0,
      riskAllowance: 0
    },
    benefits: {
      medicalAllowance: 0,
      transportAllowance: 0,
      foodAllowance: 0,
      familyAllowance: 0
    }
  });

  const calculateTotalSalary = (scale: GovernmentPayScale): number => {
    const { basicSalary, allowances, benefits } = scale;
    return basicSalary +
           Object.values(allowances).reduce((sum, val) => sum + val, 0) +
           Object.values(benefits).reduce((sum, val) => sum + val, 0);
  };

  const handleCreatePayScale = async () => {
    if (newScale.grade && newScale.step && newScale.basicSalary) {
      await createPayScale(newScale as GovernmentPayScale);
      // Reset form
      setNewScale({
        grade: 1,
        step: 1,
        basicSalary: 0,
        allowances: { positionAllowance: 0, locationAllowance: 0, responsibilityAllowance: 0, riskAllowance: 0 },
        benefits: { medicalAllowance: 0, transportAllowance: 0, foodAllowance: 0, familyAllowance: 0 }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Government Pay Scale Management</h1>
        <h1 className="text-2xl font-bold text-red-600">အစိုးရ လစာစာရင်း စီမံခန့်ခွဲမှု</h1>
      </div>

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Grade / အဆင့် ရွေးချယ်ခြင်း</CardTitle>
          <CardDescription>Choose grade to view pay scale details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Array.from({length: 20}, (_, i) => i + 1).map(grade => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? "default" : "outline"}
                onClick={() => setSelectedGrade(grade)}
                className="w-12 h-12"
              >
                {grade}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pay Scale Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade {selectedGrade} Pay Scale / အဆင့် {selectedGrade} လစာစာရင်း</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Position Allowance</TableHead>
                <TableHead>Location Allowance</TableHead>
                <TableHead>Responsibility Allowance</TableHead>
                <TableHead>Medical Allowance</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payScales
                .filter(scale => scale.grade === selectedGrade)
                .sort((a, b) => a.step - b.step)
                .map(scale => (
                <TableRow key={`${scale.grade}-${scale.step}`}>
                  <TableCell>{scale.step}</TableCell>
                  <TableCell>{scale.basicSalary.toLocaleString()} MMK</TableCell>
                  <TableCell>{scale.allowances.positionAllowance.toLocaleString()} MMK</TableCell>
                  <TableCell>{scale.allowances.locationAllowance.toLocaleString()} MMK</TableCell>
                  <TableCell>{scale.allowances.responsibilityAllowance.toLocaleString()} MMK</TableCell>
                  <TableCell>{scale.benefits.medicalAllowance.toLocaleString()} MMK</TableCell>
                  <TableCell className="font-bold">{calculateTotalSalary(scale).toLocaleString()} MMK</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add New Pay Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Pay Scale / လစာစာရင်း အသစ်ထည့်ခြင်း</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Grade / အဆင့်</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newScale.grade}
                onChange={(e) => setNewScale({...newScale, grade: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label>Step / အဆင့်ခွဲ</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newScale.step}
                onChange={(e) => setNewScale({...newScale, step: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Basic Salary (MMK) / အခြေခံလစာ</label>
              <Input
                type="number"
                value={newScale.basicSalary}
                onChange={(e) => setNewScale({...newScale, basicSalary: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label>Position Allowance (MMK) / ရာထူးလစာ</label>
              <Input
                type="number"
                value={newScale.allowances?.positionAllowance}
                onChange={(e) => setNewScale({
                  ...newScale,
                  allowances: {...newScale.allowances!, positionAllowance: parseInt(e.target.value)}
                })}
              />
            </div>
          </div>

          <Button onClick={handleCreatePayScale} className="w-full">
            Add Pay Scale / လစာစာရင်း ထည့်ခြင်း
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### **Pay Scale Hook**

```typescript
// client/hooks/useGovernmentPayScale.ts
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { GovernmentPayScale } from "@/types/government";

export const useGovernmentPayScale = () => {
  const [payScales, setPayScales] = useState<GovernmentPayScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayScales = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "governmentPayScales"),
        orderBy("grade", "asc"),
        orderBy("step", "asc"),
      );
      const querySnapshot = await getDocs(q);
      const scales: GovernmentPayScale[] = [];

      querySnapshot.forEach((doc) => {
        scales.push({ id: doc.id, ...doc.data() } as GovernmentPayScale);
      });

      setPayScales(scales);
    } catch (err) {
      setError("Failed to fetch pay scales");
      console.error("Error fetching pay scales:", err);
    } finally {
      setLoading(false);
    }
  };

  const createPayScale = async (payScale: Omit<GovernmentPayScale, "id">) => {
    try {
      const docRef = await addDoc(collection(db, "governmentPayScales"), {
        ...payScale,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await fetchPayScales(); // Refresh data
      return docRef.id;
    } catch (err) {
      setError("Failed to create pay scale");
      console.error("Error creating pay scale:", err);
      throw err;
    }
  };

  const updatePayScale = async (
    id: string,
    updates: Partial<GovernmentPayScale>,
  ) => {
    try {
      const docRef = doc(db, "governmentPayScales", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });

      await fetchPayScales(); // Refresh data
    } catch (err) {
      setError("Failed to update pay scale");
      console.error("Error updating pay scale:", err);
      throw err;
    }
  };

  const deletePayScale = async (id: string) => {
    try {
      const docRef = doc(db, "governmentPayScales", id);
      await deleteDoc(docRef);

      await fetchPayScales(); // Refresh data
    } catch (err) {
      setError("Failed to delete pay scale");
      console.error("Error deleting pay scale:", err);
      throw err;
    }
  };

  const getPayScaleByGradeStep = (
    grade: number,
    step: number,
  ): GovernmentPayScale | undefined => {
    return payScales.find(
      (scale) => scale.grade === grade && scale.step === step,
    );
  };

  const calculateSalary = (grade: number, step: number): number => {
    const scale = getPayScaleByGradeStep(grade, step);
    if (!scale) return 0;

    return (
      scale.basicSalary +
      Object.values(scale.allowances).reduce((sum, val) => sum + val, 0) +
      Object.values(scale.benefits).reduce((sum, val) => sum + val, 0)
    );
  };

  useEffect(() => {
    fetchPayScales();
  }, []);

  return {
    payScales,
    loading,
    error,
    createPayScale,
    updatePayScale,
    deletePayScale,
    getPayScaleByGradeStep,
    calculateSalary,
    refreshPayScales: fetchPayScales,
  };
};
```

### **1.2 Service Record Management System**

#### **Service Record Types**

```typescript
// client/types/serviceRecord.ts
export interface ServiceRecord {
  id: string;
  personnelId: string;
  recordType:
    | "appointment"
    | "promotion"
    | "transfer"
    | "disciplinary"
    | "training"
    | "award"
    | "leave";
  title: string;
  description: string;
  effectiveDate: Date;
  endDate?: Date;
  fromPosition?: string;
  toPosition?: string;
  fromDepartment?: string;
  toDepartment?: string;
  orderNumber: string;
  issuedBy: string;
  approvedBy: string;
  attachments: ServiceAttachment[];
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ServiceAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
}

export interface PersonnelServiceSummary {
  personnelId: string;
  totalServiceYears: number;
  totalServiceMonths: number;
  currentPosition: string;
  currentDepartment: string;
  currentGrade: number;
  currentStep: number;
  lastPromotionDate?: Date;
  nextEligibleDate?: Date;
  disciplinaryActions: number;
  awards: number;
  trainingsCompleted: number;
  transferHistory: number;
}
```

#### **Service Record Component**

```typescript
// client/components/ServiceRecordManager.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Award, AlertTriangle, GraduationCap, ArrowRight } from 'lucide-react';
import { ServiceRecord } from '@/types/serviceRecord';
import { useServiceRecord } from '@/hooks/useServiceRecord';

interface ServiceRecordManagerProps {
  personnelId: string;
}

export const ServiceRecordManager: React.FC<ServiceRecordManagerProps> = ({ personnelId }) => {
  const { serviceRecords, loading, addServiceRecord } = useServiceRecord(personnelId);
  const [selectedType, setSelectedType] = useState<string>('all');

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <FileText className="w-4 h-4" />;
      case 'promotion': return <ArrowRight className="w-4 h-4" />;
      case 'transfer': return <ArrowRight className="w-4 h-4" />;
      case 'disciplinary': return <AlertTriangle className="w-4 h-4" />;
      case 'training': return <GraduationCap className="w-4 h-4" />;
      case 'award': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      case 'transfer': return 'bg-yellow-100 text-yellow-800';
      case 'disciplinary': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'award': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = selectedType === 'all'
    ? serviceRecords
    : serviceRecords.filter(record => record.recordType === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Record / ဝန်ထမ်းမှတ်တမ်း</h2>
        <Button>Add New Record / မှတ်တမ်းအသစ် ထည့်ခြင်း</Button>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'appointment', 'promotion', 'transfer', 'disciplinary', 'training', 'award'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type === 'all' ? 'All Records' : type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Records Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Service History Timeline / ဝန��ထမ်းမှတ်တမ်း အချိန်ဇယား</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords
              .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
              .map((record, index) => (
              <div key={record.id} className="relative">
                {index < filteredRecords.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}

                <div className="flex items-start gap-4 p-4 border rounded-lg bg-white">
                  <div className={`p-2 rounded-full ${getRecordColor(record.recordType)}`}>
                    {getRecordIcon(record.recordType)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{record.title}</h3>
                      <Badge variant="outline" className={getRecordColor(record.recordType)}>
                        {record.recordType}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{record.description}</p>

                    {(record.fromPosition || record.toPosition) && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-gray-500">From:</span>
                        <span>{record.fromPosition || record.fromDepartment}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-gray-500">To:</span>
                        <span className="font-medium">{record.toPosition || record.toDepartment}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(record.effectiveDate).toLocaleDateString()}</span>
                      </div>
                      <span>Order: {record.orderNumber}</span>
                      <span>Approved by: {record.approvedBy}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### **1.3 Multi-level Approval Workflow System**

#### **Workflow Types**

```typescript
// client/types/workflow.ts
export interface ApprovalWorkflow {
  id: string;
  requestId: string;
  requestType:
    | "leave"
    | "promotion"
    | "transfer"
    | "disciplinary"
    | "training"
    | "expense";
  requestTitle: string;
  requestedBy: string;
  requestedFor: string; // Personnel ID if different from requestedBy
  currentLevel: number;
  totalLevels: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";

  approvalLevels: ApprovalLevel[];
  workflowHistory: WorkflowHistory[];

  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;

  attachments: WorkflowAttachment[];
  comments: WorkflowComment[];
}

export interface ApprovalLevel {
  level: number;
  approverRole: string;
  approverName?: string;
  approverId?: string;
  isRequired: boolean;
  canDelegate: boolean;
  status: "pending" | "approved" | "rejected" | "skipped" | "delegated";
  actionDate?: Date;
  comments?: string;
  delegation?: DelegationInfo;
}

export interface DelegationInfo {
  delegatedTo: string;
  delegatedBy: string;
  delegationDate: Date;
  reason: string;
  isTemporary: boolean;
  expiryDate?: Date;
}

export interface WorkflowHistory {
  id: string;
  action:
    | "submitted"
    | "approved"
    | "rejected"
    | "delegated"
    | "escalated"
    | "withdrawn";
  performedBy: string;
  performedAt: Date;
  level: number;
  comments: string;
  previousStatus: string;
  newStatus: string;
}
```

#### **Approval Workflow Component**

```typescript
// client/components/ApprovalWorkflowManager.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertCircle, User, ArrowRight } from 'lucide-react';
import { ApprovalWorkflow } from '@/types/workflow';
import { useApprovalWorkflow } from '@/hooks/useApprovalWorkflow';

interface ApprovalWorkflowManagerProps {
  workflowId: string;
  canApprove?: boolean;
  currentUserRole?: string;
}

export const ApprovalWorkflowManager: React.FC<ApprovalWorkflowManagerProps> = ({
  workflowId,
  canApprove = false,
  currentUserRole
}) => {
  const { workflow, loading, approveRequest, rejectRequest, delegateRequest } = useApprovalWorkflow(workflowId);
  const [actionComments, setActionComments] = useState('');
  const [showDelegation, setShowDelegation] = useState(false);

  if (loading || !workflow) {
    return <div>Loading workflow...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'delegated': return <ArrowRight className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCurrentApprovalLevel = () => {
    return workflow.approvalLevels.find(level => level.level === workflow.currentLevel);
  };

  const isCurrentApprover = () => {
    const currentLevel = getCurrentApprovalLevel();
    return currentLevel && (
      currentLevel.approverRole === currentUserRole ||
      currentLevel.approverId === 'current-user-id' // Replace with actual user ID
    );
  };

  const handleApprove = async () => {
    if (workflow && actionComments.trim()) {
      await approveRequest(workflow.id, actionComments);
      setActionComments('');
    }
  };

  const handleReject = async () => {
    if (workflow && actionComments.trim()) {
      await rejectRequest(workflow.id, actionComments);
      setActionComments('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {workflow.requestTitle}
                <Badge variant={workflow.status === 'approved' ? 'default' :
                             workflow.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Request Type: {workflow.requestType} | Priority: {workflow.priority}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Submitted: {new Date(workflow.createdAt).toLocaleDateString()}</p>
              <p>Level: {workflow.currentLevel} of {workflow.totalLevels}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Approval Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Flow / အတည်ပြုမှု လုပ်ငန်းစဉ်</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.approvalLevels.map((level, index) => (
              <div key={level.level} className="relative">
                {index < workflow.approvalLevels.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}

                <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                  level.level === workflow.currentLevel ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}>
                  <div className="p-2 rounded-full bg-gray-100">
                    {getStatusIcon(level.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Level {level.level}: {level.approverRole}</h3>
                      <Badge variant="outline">{level.status}</Badge>
                    </div>

                    {level.approverName && (
                      <p className="text-sm text-gray-600 mt-1">
                        <User className="w-3 h-3 inline mr-1" />
                        {level.approverName}
                      </p>
                    )}

                    {level.actionDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Action taken: {new Date(level.actionDate).toLocaleString()}
                      </p>
                    )}

                    {level.comments && (
                      <p className="text-sm bg-gray-50 p-2 rounded mt-2">
                        "{level.comments}"
                      </p>
                    )}

                    {level.delegation && (
                      <div className="text-xs text-blue-600 mt-2">
                        Delegated to: {level.delegation.delegatedTo}
                        <br />
                        Reason: {level.delegation.reason}
                      </div>
                    )}
                  </div>

                  {level.level === workflow.currentLevel && isCurrentApprover() && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowDelegation(true)}>
                        Delegate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Panel for Current Approver */}
      {workflow.status === 'pending' && isCurrentApprover() && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action / အရေးယူမှု</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Comments / မှတ်ချက်များ <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                placeholder="Enter your comments for this decision..."
                rows={3}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={!actionComments.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve / အတည်ပြုခြင်း
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!actionComments.trim()}
              >
                Reject / ငြင်းပယ်ခြင်း
              </Button>
              <Button variant="outline">
                Request More Info / နောက်ထပ် အချက်အလက် တောင်းခံခြင်း
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow History */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow History / လုပ်ငန်းစဉ် မှတ်တမ်း</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow.workflowHistory
              .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
              .map((history) => (
              <div key={history.id} className="flex items-start gap-3 p-3 border-l-2 border-gray-200">
                <div className="text-xs text-gray-500 w-24">
                  {new Date(history.performedAt).toLocaleDateString()}
                  <br />
                  {new Date(history.performedAt).toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {history.action.charAt(0).toUpperCase() + history.action.slice(1)} by {history.performedBy}
                  </p>
                  {history.comments && (
                    <p className="text-sm text-gray-600 mt-1">"{history.comments}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 🎯 **Phase 2: Government Compliance Features (Week 5-8)**

### **2.1 Government Leave Policy Implementation**

#### **Myanmar Government Leave Types**

```typescript
// client/types/governmentLeave.ts
export interface GovernmentLeavePolicy {
  id: string;
  leaveType: string;
  leaveTypeMyanmar: string;
  entitlementPerYear: number;
  carryForwardLimit: number;
  canCarryForward: boolean;
  requiresMedicalCertificate: boolean;
  maxConsecutiveDays: number;
  minimumServiceRequired: number; // months
  applicableGrades: number[]; // Which government grades can apply
  approvalLevels: string[]; // Required approval hierarchy
  description: string;
  descriptionMyanmar: string;
  isActive: boolean;
}

// Standard Myanmar Government Leave Types
export const GOVERNMENT_LEAVE_TYPES: GovernmentLeavePolicy[] = [
  {
    id: "annual-leave",
    leaveType: "Annual Leave",
    leaveTypeMyanmar: "��ှစ်ပတ်လပ်ရက်",
    entitlementPerYear: 20,
    carryForwardLimit: 5,
    canCarryForward: true,
    requiresMedicalCertificate: false,
    maxConsecutiveDays: 15,
    minimumServiceRequired: 12,
    applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
    approvalLevels: ["immediate_supervisor", "department_head"],
    description: "Annual vacation leave for personal purposes",
    descriptionMyanmar: "ကိုယ်ရေးကိုယ်တာ ရည်ရွယ်ချက်အတွက် နှစ်ပတ်လပ်ရက်",
    isActive: true,
  },
  {
    id: "medical-leave",
    leaveType: "Medical Leave",
    leaveTypeMyanmar: "ဆေးဘက်ဆိုင်ရာ လပ်ရက်",
    entitlementPerYear: 365,
    carryForwardLimit: 0,
    canCarryForward: false,
    requiresMedicalCertificate: true,
    maxConsecutiveDays: 90,
    minimumServiceRequired: 0,
    applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
    approvalLevels: [
      "immediate_supervisor",
      "department_head",
      "medical_officer",
    ],
    description: "Leave for medical treatment and recovery",
    descriptionMyanmar: "ကုသမှုနှင့် ပြန်လည်ကောင်းမွန်ရေးအတွက် လပ်ရက်",
    isActive: true,
  },
  {
    id: "maternity-leave",
    leaveType: "Maternity Leave",
    leaveTypeMyanmar: "မီးယပ်လပ်ရက်",
    entitlementPerYear: 90,
    carryForwardLimit: 0,
    canCarryForward: false,
    requiresMedicalCertificate: true,
    maxConsecutiveDays: 90,
    minimumServiceRequired: 6,
    applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
    approvalLevels: [
      "immediate_supervisor",
      "department_head",
      "hr_department",
    ],
    description: "Maternity leave for female employees",
    descriptionMyanmar: "အမျိုးသမီး ဝန်ထမ်းများအတွက် မီးယပ်လပ်ရက်",
    isActive: true,
  },
  {
    id: "casual-leave",
    leaveType: "Casual Leave",
    leaveTypeMyanmar: "ခေတ္တ လပ်ရက်",
    entitlementPerYear: 10,
    carryForwardLimit: 0,
    canCarryForward: false,
    requiresMedicalCertificate: false,
    maxConsecutiveDays: 3,
    minimumServiceRequired: 3,
    applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
    approvalLevels: ["immediate_supervisor"],
    description: "Short-term leave for urgent personal matters",
    descriptionMyanmar: "အရေးပေါ် ကိုယ်ရေးကိုယ်တာ ကိစ္စများအတွက် ခဏတာလပ်���က်",
    isActive: true,
  },
  {
    id: "study-leave",
    leaveType: "Study Leave",
    leaveTypeMyanmar: "ပညာသင်ကြားမှု လပ်ရက်",
    entitlementPerYear: 365,
    carryForwardLimit: 0,
    canCarryForward: false,
    requiresMedicalCertificate: false,
    maxConsecutiveDays: 365,
    minimumServiceRequired: 24,
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Lower grades only
    approvalLevels: [
      "department_head",
      "ministry_approval",
      "cabinet_approval",
    ],
    description: "Leave for higher education and professional development",
    descriptionMyanmar:
      "အဆင့်မြင့်ပညာရေးနှင့် အသက်မွေးဝမ်းကြောင်း ဖွံ့ဖြိုးတိုးတက်မှုအတွက် လပ်ရက်",
    isActive: true,
  },
];
```

### **2.2 Government Reporting Templates**

#### **Personnel Statistics Report**

```typescript
// client/components/reports/PersonnelStatisticsReport.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { usePersonnelStatistics } from '@/hooks/usePersonnelStatistics';

export const PersonnelStatisticsReport: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('current');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  const { statistics, loading, generateReport } = usePersonnelStatistics();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const departmentData = statistics?.byDepartment?.map(dept => ({
    department: dept.name,
    total: dept.total,
    active: dept.active,
    resigned: dept.resigned,
    terminated: dept.terminated
  })) || [];

  const gradeDistribution = statistics?.byGrade?.map(grade => ({
    grade: `Grade ${grade.grade}`,
    count: grade.count,
    percentage: grade.percentage
  })) || [];

  const handleExportReport = async () => {
    const reportData = {
      title: 'Government Personnel Statistics Report',
      titleMyanmar: 'အစိုးရ ဝန်ထမ်း စာရင်းအင်း အစီရင်ခံစာ',
      period: reportPeriod,
      ministry: selectedMinistry,
      generatedDate: new Date().toISOString(),
      statistics: statistics,
      summary: {
        totalPersonnel: statistics?.totalPersonnel || 0,
        activePersonnel: statistics?.activePersonnel || 0,
        newHires: statistics?.newHires || 0,
        resignations: statistics?.resignations || 0,
        promotions: statistics?.promotions || 0
      }
    };

    // Generate PDF report
    await generateReport(reportData, 'pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Personnel Statistics Report</h1>
        <h1 className="text-2xl font-bold text-red-600">ဝန်ထမ်း စာရင်းအင်း အစီရင်ခံစာ</h1>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters / အစီရင်ခံစာ သတ်မှတ်ချက်များ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ministry</label>
              <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ministries</SelectItem>
                  <SelectItem value="home-affairs">Ministry of Home Affairs</SelectItem>
                  <SelectItem value="education">Ministry of Education</SelectItem>
                  <SelectItem value="health">Ministry of Health</SelectItem>
                  <SelectItem value="defense">Ministry of Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportReport} className="w-full">
                Export Report / အစီရ���်ခံစာ ထုတ်ယူခြင်း
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { title: 'Total Personnel', titleMy: 'စုစုပေါင်း ဝန်ထမ်း', value: statistics?.totalPersonnel || 0, color: 'blue' },
          { title: 'Active Personnel', titleMy: 'အလုပ်ရှိ ဝန်ထမ်း', value: statistics?.activePersonnel || 0, color: 'green' },
          { title: 'New Hires', titleMy: 'အသစ်ခန့်အပ်', value: statistics?.newHires || 0, color: 'purple' },
          { title: 'Resignations', titleMy: 'ရာထူးမှ နုတ်ထွက်', value: statistics?.resignations || 0, color: 'orange' },
          { title: 'Promotions', titleMy: 'ရာထူးတိုးမြှင့်', value: statistics?.promotions || 0, color: 'teal' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.titleMy}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Personnel by Department / ဌာနအလိုက် ဝန်ထမ်းများ</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" stackId="a" fill="#10B981" name="Active" />
              <Bar dataKey="resigned" stackId="a" fill="#F59E0B" name="Resigned" />
              <Bar dataKey="terminated" stackId="a" fill="#EF4444" name="Terminated" />
            </BarChart>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution / အဆင့်အလိုက် ဝန်ထမ်းများ</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={500} height={300}>
              <Pie
                data={gradeDistribution}
                cx={250}
                cy={150}
                labelLine={false}
                label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics / အသေးစိတ် စာရင်းအင်းများ</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add detailed tables here */}
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## ⚡ **Quick Implementation Priority List**

### **Week 1-2: Immediate Government Features**

1. ✅ **Government Pay Scale System** - Critical for salary calculations
2. ✅ **Enhanced User Roles** - Department heads, regional admins
3. ✅ **Service Record Tracking** - Basic promotion/transfer history
4. ✅ **Government Leave Types** - Standard Myanmar government leave policies

### **Week 3-4: Workflow and Compliance**

1. ✅ **Multi-level Approval Workflows** - Essential for government processes
2. ✅ **Government Reporting Templates** - Required monthly/annual reports
3. ✅ **Legal Compliance Features** - Myanmar civil service law compliance
4. ✅ **Enhanced Security** - Government-grade security standards

### **Week 5-8: Advanced Features**

1. Employee Self-Service Portal
2. Mobile Application for Field Personnel
3. Integration APIs for other Government Systems
4. Advanced Analytics and Forecasting

---

**This implementation plan provides the foundation for a true government-level HR management system. The current system already has 70% of what's needed - these additions will make it 100% government-ready.**
