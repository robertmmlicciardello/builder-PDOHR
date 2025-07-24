import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  ArrowRight, 
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useApprovalWorkflow, useWorkflowTemplate } from '@/hooks/useApprovalWorkflow';
import { ApprovalWorkflow, ApprovalLevel } from '@/types/government';
import { useToast } from '@/hooks/use-toast';

interface ApprovalWorkflowManagementProps {
  userId?: string;
  userRole?: string;
}

export const ApprovalWorkflowManagement: React.FC<ApprovalWorkflowManagementProps> = ({ 
  userId = 'current-user',
  userRole = 'department_head'
}) => {
  const { workflows, loading, fetchUserWorkflows, approveRequest, rejectRequest, delegateRequest } = useApprovalWorkflow();
  const { createLeaveApprovalWorkflow, createPromotionApprovalWorkflow, createTransferApprovalWorkflow } = useWorkflowTemplate();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delegate' | 'view'>('view');
  const [actionComments, setActionComments] = useState('');
  const [delegateTo, setDelegateTo] = useState('');
  const [delegateToName, setDelegateToName] = useState('');
  const [delegationReason, setDelegationReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const statusFilters = [
    { value: 'pending', label: 'Pending Approval', count: 0 },
    { value: 'approved', label: 'Approved', count: 0 },
    { value: 'rejected', label: 'Rejected', count: 0 },
    { value: 'escalated', label: 'Escalated', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'escalated': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkflowProgress = (workflow: ApprovalWorkflow): number => {
    return Math.round((workflow.currentLevel / workflow.totalLevels) * 100);
  };

  const getCurrentApprover = (workflow: ApprovalWorkflow): ApprovalLevel | undefined => {
    return workflow.approvalLevels.find(level => level.level === workflow.currentLevel);
  };

  const isCurrentUserApprover = (workflow: ApprovalWorkflow): boolean => {
    const currentApprover = getCurrentApprover(workflow);
    return currentApprover?.approverId === userId || 
           currentApprover?.approverRole === userRole;
  };

  const getFilteredWorkflows = () => {
    let filtered = workflows;

    if (selectedTab !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === selectedTab);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(workflow => workflow.requestType === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(workflow => 
        workflow.requestTitle.toLowerCase().includes(term) ||
        workflow.requestTitleMyanmar.toLowerCase().includes(term) ||
        workflow.requestType.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };

  const handleApprove = async () => {
    if (!selectedWorkflow || !actionComments.trim()) return;

    try {
      await approveRequest(selectedWorkflow.id, actionComments, userId);
      toast({
        title: "Success",
        description: "Request approved successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetDialog();
      await fetchUserWorkflows(userId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedWorkflow || !actionComments.trim()) return;

    try {
      await rejectRequest(selectedWorkflow.id, actionComments, userId);
      toast({
        title: "Success",
        description: "Request rejected",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetDialog();
      await fetchUserWorkflows(userId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const handleDelegate = async () => {
    if (!selectedWorkflow || !delegateTo || !delegateToName || !delegationReason.trim()) return;

    try {
      await delegateRequest(selectedWorkflow.id, delegateTo, delegateToName, delegationReason, true);
      toast({
        title: "Success",
        description: "Request delegated successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetDialog();
      await fetchUserWorkflows(userId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delegate request",
        variant: "destructive"
      });
    }
  };

  const resetDialog = () => {
    setSelectedWorkflow(null);
    setActionComments('');
    setDelegateTo('');
    setDelegateToName('');
    setDelegationReason('');
  };

  const openActionDialog = (workflow: ApprovalWorkflow, action: 'approve' | 'reject' | 'delegate' | 'view') => {
    setSelectedWorkflow(workflow);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const remaining = deadlineTime - now;

    if (remaining <= 0) return 'Overdue';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days remaining`;
    if (hours > 0) return `${hours} hours remaining`;
    return 'Due soon';
  };

  const filteredWorkflows = getFilteredWorkflows();

  // Update status counts
  statusFilters.forEach(filter => {
    filter.count = workflows.filter(w => w.status === filter.value).length;
  });

  useEffect(() => {
    fetchUserWorkflows(userId);
  }, [userId]);

  if (loading && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading approval workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Approval Workflow Management</h1>
          <h2 className="text-2xl font-bold text-red-600 mt-1">အတည်ပြုမှု လုပ်ငန်းစဉ် စီမံခန့်ခွဲမှု</h2>
          <p className="text-gray-600 mt-2">Manage approval workflows and pending requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {statusFilters.map((filter, index) => (
          <Card key={filter.value} className={selectedTab === filter.value ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{filter.count}</div>
                <p className="text-sm font-medium">{filter.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="leave">Leave Requests</SelectItem>
                <SelectItem value="promotion">Promotions</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="disciplinary">Disciplinary</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All ({workflows.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusFilters.find(f => f.value === 'pending')?.count || 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusFilters.find(f => f.value === 'approved')?.count || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusFilters.find(f => f.value === 'rejected')?.count || 0})</TabsTrigger>
          <TabsTrigger value="escalated">Escalated ({statusFilters.find(f => f.value === 'escalated')?.count || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader>
              <CardTitle>Workflows / လუပ်ငန်းစဉ်များ</CardTitle>
              <CardDescription>
                {filteredWorkflows.length} workflows found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredWorkflows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Current Approver</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkflows.map(workflow => {
                      const currentApprover = getCurrentApprover(workflow);
                      const isCurrentApprover = isCurrentUserApprover(workflow);
                      const progress = getWorkflowProgress(workflow);
                      
                      return (
                        <TableRow key={workflow.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{workflow.requestTitle}</div>
                              {workflow.requestTitleMyanmar && (
                                <div className="text-sm text-gray-500">{workflow.requestTitleMyanmar}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {workflow.requestType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(workflow.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(workflow.status)}
                                <span className="capitalize">{workflow.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={progress} className="w-20" />
                              <span className="text-xs text-gray-500">
                                Level {workflow.currentLevel} of {workflow.totalLevels}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(workflow.priority)}>
                              {workflow.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(workflow.submittedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {workflow.deadline && (
                              <div className={`text-sm ${
                                new Date(workflow.deadline) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'
                              }`}>
                                {formatTimeRemaining(workflow.deadline)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {currentApprover && (
                              <div className="text-sm">
                                <div className="font-medium">{currentApprover.approverRole}</div>
                                <div className="text-gray-500">{currentApprover.approverRoleMyanmar}</div>
                                {isCurrentApprover && (
                                  <Badge variant="outline" className="text-xs mt-1">You</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionDialog(workflow, 'view')}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {isCurrentApprover && workflow.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openActionDialog(workflow, 'approve')}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openActionDialog(workflow, 'reject')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                  {currentApprover?.canDelegate && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => openActionDialog(workflow, 'delegate')}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Users className="w-3 h-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No workflows found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'delegate' && 'Delegate Request'}
              {actionType === 'view' && 'Workflow Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkflow && (
                <>
                  {selectedWorkflow.requestTitle}
                  {selectedWorkflow.requestTitleMyanmar && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {selectedWorkflow.requestTitleMyanmar}
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedWorkflow && (
            <div className="space-y-6">
              {/* Workflow Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval Flow / အတည်ပြုမှု လုပ်ငန်းစဉ်</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedWorkflow.approvalLevels.map((level, index) => (
                      <div key={level.level} className="relative">
                        {index < selectedWorkflow.approvalLevels.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                          level.level === selectedWorkflow.currentLevel ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}>
                          <div className="p-2 rounded-full bg-gray-100">
                            {getStatusIcon(level.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">Level {level.level}: {level.approverRole}</h3>
                              <Badge variant="outline">{level.status}</Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">{level.approverRoleMyanmar}</p>
                            
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
                                Delegated to: {level.delegation.delegatedToName}
                                <br />
                                Reason: {level.delegation.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Inputs */}
              {actionType !== 'view' && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {actionType === 'approve' && 'Approval Comments'}
                      {actionType === 'reject' && 'Rejection Reason'}
                      {actionType === 'delegate' && 'Delegation Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {actionType === 'delegate' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Delegate To (User ID)</Label>
                            <Input
                              value={delegateTo}
                              onChange={(e) => setDelegateTo(e.target.value)}
                              placeholder="Enter user ID"
                            />
                          </div>
                          <div>
                            <Label>Delegate To (Name)</Label>
                            <Input
                              value={delegateToName}
                              onChange={(e) => setDelegateToName(e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Delegation Reason</Label>
                          <Textarea
                            value={delegationReason}
                            onChange={(e) => setDelegationReason(e.target.value)}
                            placeholder="Enter reason for delegation"
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                    
                    <div>
                      <Label>
                        {actionType === 'approve' && 'Comments'}
                        {actionType === 'reject' && 'Reason for Rejection'}
                        {actionType === 'delegate' && 'Additional Comments'}
                      </Label>
                      <Textarea
                        value={actionComments}
                        onChange={(e) => setActionComments(e.target.value)}
                        placeholder={
                          actionType === 'approve' ? 'Enter your approval comments...' :
                          actionType === 'reject' ? 'Enter reason for rejection...' :
                          'Enter additional comments...'
                        }
                        rows={4}
                        required
                      />
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
                    {selectedWorkflow.workflowHistory
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
                            {history.action.charAt(0).toUpperCase() + history.action.slice(1)} by {history.performedByName}
                          </p>
                          <p className="text-xs text-gray-500">{history.actionMyanmar}</p>
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {actionType === 'approve' && (
              <Button 
                onClick={handleApprove}
                disabled={!actionComments.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Request
              </Button>
            )}
            {actionType === 'reject' && (
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={!actionComments.trim()}
              >
                Reject Request
              </Button>
            )}
            {actionType === 'delegate' && (
              <Button 
                onClick={handleDelegate}
                disabled={!delegateTo || !delegateToName || !delegationReason.trim()}
              >
                Delegate Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflowManagement;
