import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ApprovalWorkflow, ApprovalLevel, WorkflowHistory, DelegationInfo } from '@/types/government';

export const useApprovalWorkflow = (workflowId?: string) => {
  const [workflow, setWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = async (id: string) => {
    try {
      setLoading(true);
      const workflowDoc = await getDocs(query(
        collection(db, 'approvalWorkflows'),
        where('__name__', '==', id)
      ));
      
      if (!workflowDoc.empty) {
        const data = workflowDoc.docs[0].data();
        setWorkflow({
          id: workflowDoc.docs[0].id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          deadline: data.deadline?.toDate(),
          completedAt: data.completedAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          workflowHistory: data.workflowHistory?.map((h: any) => ({
            ...h,
            performedAt: h.performedAt?.toDate()
          })) || [],
          approvalLevels: data.approvalLevels?.map((l: any) => ({
            ...l,
            actionDate: l.actionDate?.toDate(),
            delegation: l.delegation ? {
              ...l.delegation,
              delegationDate: l.delegation.delegationDate?.toDate(),
              expiryDate: l.delegation.expiryDate?.toDate()
            } : undefined
          })) || []
        } as ApprovalWorkflow);
      }
    } catch (err) {
      setError('Failed to fetch workflow');
      console.error('Error fetching workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkflows = async (userId: string, status?: string) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'approvalWorkflows'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      const workflowList: ApprovalWorkflow[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter workflows where user is involved in approval process
        const userInvolved = data.approvalLevels?.some((level: any) => 
          level.approverId === userId || level.approverRole === 'department_head' // Add role-based filtering
        );
        
        if (userInvolved || data.requestedBy === userId) {
          workflowList.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate(),
            deadline: data.deadline?.toDate(),
            completedAt: data.completedAt?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            workflowHistory: data.workflowHistory?.map((h: any) => ({
              ...h,
              performedAt: h.performedAt?.toDate()
            })) || [],
            approvalLevels: data.approvalLevels?.map((l: any) => ({
              ...l,
              actionDate: l.actionDate?.toDate(),
              delegation: l.delegation ? {
                ...l.delegation,
                delegationDate: l.delegation.delegationDate?.toDate(),
                expiryDate: l.delegation.expiryDate?.toDate()
              } : undefined
            })) || []
          } as ApprovalWorkflow);
        }
      });
      
      setWorkflows(workflowList);
    } catch (err) {
      setError('Failed to fetch workflows');
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflowData: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'approvalWorkflows'), {
        ...workflowData,
        currentLevel: 1,
        status: 'pending',
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        workflowHistory: [{
          id: `history_${Date.now()}`,
          action: 'submitted',
          actionMyanmar: 'တ��်သွင်းခြင်း',
          performedBy: workflowData.requestedBy,
          performedByName: 'Current User', // Should be actual user name
          performedAt: new Date(),
          level: 0,
          comments: 'Workflow submitted for approval',
          commentsMyanmar: 'အတည်ပြုမှုအတွက် တင်သွင်းထားသည်',
          previousStatus: '',
          newStatus: 'pending'
        }]
      });
      
      return docRef.id;
    } catch (err) {
      setError('Failed to create workflow');
      console.error('Error creating workflow:', err);
      throw err;
    }
  };

  const approveRequest = async (workflowId: string, comments: string, approverId: string = 'current-user') => {
    try {
      if (!workflow) return;

      const currentLevel = workflow.approvalLevels.find(level => level.level === workflow.currentLevel);
      if (!currentLevel) throw new Error('Invalid approval level');

      // Update current level
      const updatedLevels = workflow.approvalLevels.map(level => 
        level.level === workflow.currentLevel 
          ? { ...level, status: 'approved' as const, actionDate: new Date(), comments, approverId }
          : level
      );

      // Create history entry
      const historyEntry: WorkflowHistory = {
        id: `history_${Date.now()}`,
        action: 'approved',
        actionMyanmar: 'အတည်ပြုခြင်း',
        performedBy: approverId,
        performedByName: 'Current User', // Should be actual user name
        performedAt: new Date(),
        level: workflow.currentLevel,
        comments,
        commentsMyanmar: comments, // Should translate or provide Myanmar version
        previousStatus: 'pending',
        newStatus: 'approved'
      };

      // Determine next state
      const isLastLevel = workflow.currentLevel >= workflow.totalLevels;
      const newStatus = isLastLevel ? 'approved' : 'pending';
      const newLevel = isLastLevel ? workflow.currentLevel : workflow.currentLevel + 1;
      const completedAt = isLastLevel ? new Date() : undefined;

      await updateDoc(doc(db, 'approvalWorkflows', workflowId), {
        approvalLevels: updatedLevels,
        workflowHistory: [...workflow.workflowHistory, historyEntry],
        currentLevel: newLevel,
        status: newStatus,
        completedAt,
        updatedAt: new Date()
      });

      if (workflowId === workflow.id) {
        await fetchWorkflow(workflowId);
      }
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
      throw err;
    }
  };

  const rejectRequest = async (workflowId: string, reason: string, rejectorId: string = 'current-user') => {
    try {
      if (!workflow) return;

      // Update current level
      const updatedLevels = workflow.approvalLevels.map(level => 
        level.level === workflow.currentLevel 
          ? { ...level, status: 'rejected' as const, actionDate: new Date(), comments: reason, approverId: rejectorId }
          : level
      );

      // Create history entry
      const historyEntry: WorkflowHistory = {
        id: `history_${Date.now()}`,
        action: 'rejected',
        actionMyanmar: 'ငြင်းပယ်ခြင်း',
        performedBy: rejectorId,
        performedByName: 'Current User', // Should be actual user name
        performedAt: new Date(),
        level: workflow.currentLevel,
        comments: reason,
        commentsMyanmar: reason, // Should translate or provide Myanmar version
        previousStatus: 'pending',
        newStatus: 'rejected'
      };

      await updateDoc(doc(db, 'approvalWorkflows', workflowId), {
        approvalLevels: updatedLevels,
        workflowHistory: [...workflow.workflowHistory, historyEntry],
        status: 'rejected',
        completedAt: new Date(),
        updatedAt: new Date()
      });

      if (workflowId === workflow.id) {
        await fetchWorkflow(workflowId);
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
      throw err;
    }
  };

  const delegateRequest = async (
    workflowId: string, 
    delegatedTo: string, 
    delegatedToName: string,
    reason: string,
    isTemporary: boolean = true,
    expiryDate?: Date
  ) => {
    try {
      if (!workflow) return;

      const delegation: DelegationInfo = {
        delegatedTo,
        delegatedToName,
        delegatedBy: 'current-user', // Should be actual user ID
        delegationDate: new Date(),
        reason,
        reasonMyanmar: reason, // Should translate or provide Myanmar version
        isTemporary,
        expiryDate,
        isActive: true
      };

      // Update current level with delegation
      const updatedLevels = workflow.approvalLevels.map(level => 
        level.level === workflow.currentLevel 
          ? { 
              ...level, 
              status: 'delegated' as const, 
              actionDate: new Date(), 
              delegation,
              approverId: delegatedTo
            }
          : level
      );

      // Create history entry
      const historyEntry: WorkflowHistory = {
        id: `history_${Date.now()}`,
        action: 'delegated',
        actionMyanmar: 'လွှဲပြောင်းခြင်း',
        performedBy: 'current-user',
        performedByName: 'Current User',
        performedAt: new Date(),
        level: workflow.currentLevel,
        comments: `Delegated to ${delegatedToName}: ${reason}`,
        commentsMyanmar: `${delegatedToName} သို့ လွှဲပြောင်းခြင်း: ${reason}`,
        previousStatus: 'pending',
        newStatus: 'delegated'
      };

      await updateDoc(doc(db, 'approvalWorkflows', workflowId), {
        approvalLevels: updatedLevels,
        workflowHistory: [...workflow.workflowHistory, historyEntry],
        updatedAt: new Date()
      });

      if (workflowId === workflow.id) {
        await fetchWorkflow(workflowId);
      }
    } catch (err) {
      setError('Failed to delegate request');
      console.error('Error delegating request:', err);
      throw err;
    }
  };

  const withdrawRequest = async (workflowId: string, reason: string) => {
    try {
      if (!workflow) return;

      // Create history entry
      const historyEntry: WorkflowHistory = {
        id: `history_${Date.now()}`,
        action: 'withdrawn',
        actionMyanmar: 'ပြန်လည်ရုပ်သိမ်းခြင်း',
        performedBy: workflow.requestedBy,
        performedByName: 'Requester',
        performedAt: new Date(),
        level: workflow.currentLevel,
        comments: reason,
        commentsMyanmar: reason,
        previousStatus: workflow.status,
        newStatus: 'cancelled'
      };

      await updateDoc(doc(db, 'approvalWorkflows', workflowId), {
        workflowHistory: [...workflow.workflowHistory, historyEntry],
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date()
      });

      if (workflowId === workflow.id) {
        await fetchWorkflow(workflowId);
      }
    } catch (err) {
      setError('Failed to withdraw request');
      console.error('Error withdrawing request:', err);
      throw err;
    }
  };

  const escalateRequest = async (workflowId: string, escalationReason: string) => {
    try {
      if (!workflow) return;

      // Create history entry
      const historyEntry: WorkflowHistory = {
        id: `history_${Date.now()}`,
        action: 'escalated',
        actionMyanmar: 'အဆင့်မြှင့်တင်ခြင်း',
        performedBy: 'system',
        performedByName: 'System',
        performedAt: new Date(),
        level: workflow.currentLevel,
        comments: escalationReason,
        commentsMyanmar: escalationReason,
        previousStatus: workflow.status,
        newStatus: 'escalated'
      };

      await updateDoc(doc(db, 'approvalWorkflows', workflowId), {
        workflowHistory: [...workflow.workflowHistory, historyEntry],
        status: 'escalated',
        priority: 'urgent',
        updatedAt: new Date()
      });

      if (workflowId === workflow.id) {
        await fetchWorkflow(workflowId);
      }
    } catch (err) {
      setError('Failed to escalate request');
      console.error('Error escalating request:', err);
      throw err;
    }
  };

  const getWorkflowProgress = (): number => {
    if (!workflow) return 0;
    return Math.round((workflow.currentLevel / workflow.totalLevels) * 100);
  };

  const getCurrentApprover = (): ApprovalLevel | undefined => {
    if (!workflow) return undefined;
    return workflow.approvalLevels.find(level => level.level === workflow.currentLevel);
  };

  const isCurrentUserApprover = (userId: string): boolean => {
    const currentApprover = getCurrentApprover();
    return currentApprover?.approverId === userId || 
           currentApprover?.approverRole === 'department_head'; // Add role-based check
  };

  const canUserDelegate = (userId: string): boolean => {
    const currentApprover = getCurrentApprover();
    return currentApprover?.canDelegate && isCurrentUserApprover(userId);
  };

  const getTimeRemaining = (): number | null => {
    if (!workflow?.deadline) return null;
    const now = new Date().getTime();
    const deadline = new Date(workflow.deadline).getTime();
    return Math.max(0, deadline - now);
  };

  const isOverdue = (): boolean => {
    const timeRemaining = getTimeRemaining();
    return timeRemaining !== null && timeRemaining <= 0;
  };

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId]);

  return {
    workflow,
    workflows,
    loading,
    error,
    createWorkflow,
    approveRequest,
    rejectRequest,
    delegateRequest,
    withdrawRequest,
    escalateRequest,
    fetchUserWorkflows,
    getWorkflowProgress,
    getCurrentApprover,
    isCurrentUserApprover,
    canUserDelegate,
    getTimeRemaining,
    isOverdue,
    refreshWorkflow: () => workflowId && fetchWorkflow(workflowId)
  };
};

// Hook for managing workflow templates
export const useWorkflowTemplate = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const createLeaveApprovalWorkflow = (
    requestId: string,
    requestedBy: string,
    requestedFor: string,
    leaveType: string,
    duration: number
  ): Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> => {
    
    const approvalLevels: ApprovalLevel[] = [
      {
        level: 1,
        approverRole: 'immediate_supervisor',
        approverRoleMyanmar: 'တိုက်ရိုက်ကြီးကြပ်ရေးမှူး',
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        timeoutHours: 24,
        status: 'pending'
      },
      {
        level: 2,
        approverRole: 'department_head',
        approverRoleMyanmar: 'ဌာနအုပ်',
        isRequired: duration > 5, // Only required for leaves longer than 5 days
        canDelegate: true,
        canSkip: duration <= 5,
        timeoutHours: 48,
        status: 'pending'
      }
    ];

    // Add HR approval for special leave types
    if (['medical', 'maternity', 'study'].includes(leaveType)) {
      approvalLevels.push({
        level: 3,
        approverRole: 'hr_department',
        approverRoleMyanmar: 'ဝန်ထမ်းရေးရာဌာန',
        isRequired: true,
        canDelegate: false,
        canSkip: false,
        timeoutHours: 72,
        status: 'pending'
      });
    }

    return {
      requestId,
      requestType: 'leave',
      requestTitle: `${leaveType} Leave Request`,
      requestTitleMyanmar: `${leaveType} လပ်ရက်တောင်းခံစာ`,
      requestedBy,
      requestedFor,
      currentLevel: 1,
      totalLevels: approvalLevels.length,
      status: 'pending',
      priority: duration > 15 ? 'high' : 'medium',
      approvalLevels,
      workflowHistory: [],
      submittedAt: new Date(),
      deadline: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days deadline
      attachments: [],
      comments: []
    };
  };

  const createPromotionApprovalWorkflow = (
    requestId: string,
    requestedBy: string,
    requestedFor: string,
    fromGrade: number,
    toGrade: number
  ): Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> => {
    
    const approvalLevels: ApprovalLevel[] = [
      {
        level: 1,
        approverRole: 'department_head',
        approverRoleMyanmar: 'ဌာနအုပ်',
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        timeoutHours: 72,
        status: 'pending'
      },
      {
        level: 2,
        approverRole: 'hr_department',
        approverRoleMyanmar: 'ဝန်ထမ်းရေးရာဌာန',
        isRequired: true,
        canDelegate: false,
        canSkip: false,
        timeoutHours: 120,
        status: 'pending'
      }
    ];

    // High-grade promotions need additional approval
    if (toGrade >= 15) {
      approvalLevels.push({
        level: 3,
        approverRole: 'ministry_approval',
        approverRoleMyanmar: 'ဝန်ကြီးဌာန အတည်ပြုမှု',
        isRequired: true,
        canDelegate: false,
        canSkip: false,
        timeoutHours: 240,
        status: 'pending'
      });
    }

    return {
      requestId,
      requestType: 'promotion',
      requestTitle: `Promotion from Grade ${fromGrade} to Grade ${toGrade}`,
      requestTitleMyanmar: `အဆင့် ${fromGrade} မှ အဆင့် ${toGrade} သို့ ရာထူးတိုးမြှင့်မှု`,
      requestedBy,
      requestedFor,
      currentLevel: 1,
      totalLevels: approvalLevels.length,
      status: 'pending',
      priority: 'high',
      approvalLevels,
      workflowHistory: [],
      submittedAt: new Date(),
      deadline: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days deadline
      attachments: [],
      comments: []
    };
  };

  const createTransferApprovalWorkflow = (
    requestId: string,
    requestedBy: string,
    requestedFor: string,
    fromDepartment: string,
    toDepartment: string
  ): Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> => {
    
    const approvalLevels: ApprovalLevel[] = [
      {
        level: 1,
        approverRole: 'current_department_head',
        approverRoleMyanmar: 'လက်ရှိဌာနအုပ်',
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        timeoutHours: 72,
        status: 'pending'
      },
      {
        level: 2,
        approverRole: 'receiving_department_head',
        approverRoleMyanmar: 'လက်ခံမည့်ဌာနအုပ်',
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        timeoutHours: 72,
        status: 'pending'
      },
      {
        level: 3,
        approverRole: 'hr_department',
        approverRoleMyanmar: 'ဝန်ထမ်းရေးရာဌာန',
        isRequired: true,
        canDelegate: false,
        canSkip: false,
        timeoutHours: 120,
        status: 'pending'
      }
    ];

    return {
      requestId,
      requestType: 'transfer',
      requestTitle: `Transfer from ${fromDepartment} to ${toDepartment}`,
      requestTitleMyanmar: `${fromDepartment} မှ ${toDepartment} သို့ နေရာပြောင်းမှု`,
      requestedBy,
      requestedFor,
      currentLevel: 1,
      totalLevels: approvalLevels.length,
      status: 'pending',
      priority: 'medium',
      approvalLevels,
      workflowHistory: [],
      submittedAt: new Date(),
      deadline: new Date(Date.now() + (21 * 24 * 60 * 60 * 1000)), // 21 days deadline
      attachments: [],
      comments: []
    };
  };

  return {
    templates,
    loading,
    createLeaveApprovalWorkflow,
    createPromotionApprovalWorkflow,
    createTransferApprovalWorkflow
  };
};
