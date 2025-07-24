import { useState, useEffect } from 'react';
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
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ServiceRecord, ServiceAttachment, PersonnelServiceSummary } from '@/types/government';

export const useServiceRecord = (personnelId?: string) => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const fetchServiceRecords = async (personnelIdParam?: string, loadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(collection(db, 'serviceRecords'));
      
      if (personnelIdParam || personnelId) {
        q = query(q, where('personnelId', '==', personnelIdParam || personnelId));
      }
      
      q = query(q, orderBy('effectiveDate', 'desc'), limit(20));
      
      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const records: ServiceRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({ 
          id: doc.id, 
          ...data,
          effectiveDate: data.effectiveDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ServiceRecord);
      });
      
      if (loadMore) {
        setServiceRecords(prev => [...prev, ...records]);
      } else {
        setServiceRecords(records);
      }
      
      setHasMore(querySnapshot.docs.length === 20);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      
    } catch (err) {
      setError('Failed to fetch service records');
      console.error('Error fetching service records:', err);
    } finally {
      setLoading(false);
    }
  };

  const createServiceRecord = async (record: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Generate order number if not provided
      if (!record.orderNumber) {
        const timestamp = new Date().getTime();
        record.orderNumber = `${record.recordType.toUpperCase()}-${timestamp}`;
      }

      const docRef = await addDoc(collection(db, 'serviceRecords'), {
        ...record,
        status: record.status || 'draft',
        urgency: record.urgency || 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await fetchServiceRecords(record.personnelId);
      return docRef.id;
    } catch (err) {
      setError('Failed to create service record');
      console.error('Error creating service record:', err);
      throw err;
    }
  };

  const updateServiceRecord = async (id: string, updates: Partial<ServiceRecord>) => {
    try {
      const docRef = doc(db, 'serviceRecords', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      await fetchServiceRecords(personnelId);
    } catch (err) {
      setError('Failed to update service record');
      console.error('Error updating service record:', err);
      throw err;
    }
  };

  const deleteServiceRecord = async (id: string) => {
    try {
      const docRef = doc(db, 'serviceRecords', id);
      await deleteDoc(docRef);
      
      await fetchServiceRecords(personnelId);
    } catch (err) {
      setError('Failed to delete service record');
      console.error('Error deleting service record:', err);
      throw err;
    }
  };

  const approveServiceRecord = async (id: string, approverName: string, comments?: string) => {
    try {
      await updateServiceRecord(id, {
        status: 'approved',
        approvedBy: approverName,
        remarks: comments || ''
      });
    } catch (err) {
      setError('Failed to approve service record');
      throw err;
    }
  };

  const rejectServiceRecord = async (id: string, rejectorName: string, reason: string) => {
    try {
      await updateServiceRecord(id, {
        status: 'rejected',
        approvedBy: rejectorName,
        remarks: reason
      });
    } catch (err) {
      setError('Failed to reject service record');
      throw err;
    }
  };

  const getRecordsByType = (recordType: ServiceRecord['recordType']): ServiceRecord[] => {
    return serviceRecords.filter(record => record.recordType === recordType);
  };

  const getRecordsByStatus = (status: ServiceRecord['status']): ServiceRecord[] => {
    return serviceRecords.filter(record => record.status === status);
  };

  const getRecentRecords = (count: number = 5): ServiceRecord[] => {
    return serviceRecords
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
      .slice(0, count);
  };

  const searchRecords = (searchTerm: string): ServiceRecord[] => {
    const term = searchTerm.toLowerCase();
    return serviceRecords.filter(record => 
      record.title.toLowerCase().includes(term) ||
      record.description.toLowerCase().includes(term) ||
      record.orderNumber.toLowerCase().includes(term) ||
      record.recordType.toLowerCase().includes(term)
    );
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchServiceRecords(personnelId, true);
    }
  };

  useEffect(() => {
    if (personnelId) {
      fetchServiceRecords(personnelId);
    }
  }, [personnelId]);

  return {
    serviceRecords,
    loading,
    error,
    hasMore,
    createServiceRecord,
    updateServiceRecord,
    deleteServiceRecord,
    approveServiceRecord,
    rejectServiceRecord,
    getRecordsByType,
    getRecordsByStatus,
    getRecentRecords,
    searchRecords,
    loadMore,
    refreshRecords: () => fetchServiceRecords(personnelId)
  };
};

// Hook for managing service record attachments
export const useServiceAttachment = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadAttachment = async (file: File, serviceRecordId: string, description: string = ''): Promise<ServiceAttachment> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // This is a placeholder for file upload logic
      // In a real implementation, you would upload to Firebase Storage or another service
      const attachment: ServiceAttachment = {
        id: `attachment_${Date.now()}`,
        fileName: `${serviceRecordId}_${file.name}`,
        originalName: file.name,
        fileUrl: URL.createObjectURL(file), // Placeholder - use actual upload URL
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        uploadedBy: 'current-user', // Replace with actual user
        description
      };

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return attachment;
    } catch (err) {
      console.error('Error uploading attachment:', err);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteAttachment = async (attachmentId: string, serviceRecordId: string) => {
    try {
      // Implementation for deleting attachment from storage
      console.log('Deleting attachment:', attachmentId, 'from record:', serviceRecordId);
      // Add actual deletion logic here
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadAttachment,
    deleteAttachment
  };
};

// Hook for personnel service summary
export const usePersonnelServiceSummary = (personnelId: string) => {
  const [summary, setSummary] = useState<PersonnelServiceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateServiceSummary = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch all service records for this personnel
      const q = query(
        collection(db, 'serviceRecords'),
        where('personnelId', '==', id),
        orderBy('effectiveDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: ServiceRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({ 
          id: doc.id, 
          ...data,
          effectiveDate: data.effectiveDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ServiceRecord);
      });

      // Calculate service summary
      const firstAppointment = records.find(r => r.recordType === 'appointment');
      const appointments = records.filter(r => r.recordType === 'appointment');
      const promotions = records.filter(r => r.recordType === 'promotion');
      const transfers = records.filter(r => r.recordType === 'transfer');
      const disciplinary = records.filter(r => r.recordType === 'disciplinary');
      const awards = records.filter(r => r.recordType === 'award');
      const trainings = records.filter(r => r.recordType === 'training');

      const startDate = firstAppointment?.effectiveDate || new Date();
      const currentDate = new Date();
      const serviceTime = currentDate.getTime() - startDate.getTime();
      const serviceDays = Math.floor(serviceTime / (1000 * 60 * 60 * 24));
      const serviceYears = Math.floor(serviceDays / 365);
      const serviceMonths = Math.floor((serviceDays % 365) / 30);

      // Get current position from latest promotion or appointment
      const latestPositionRecord = [...promotions, ...appointments]
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];

      const calculatedSummary: PersonnelServiceSummary = {
        personnelId: id,
        totalServiceYears: serviceYears,
        totalServiceMonths: serviceMonths,
        totalServiceDays: serviceDays,
        currentPosition: latestPositionRecord?.toPosition || 'Not assigned',
        currentDepartment: latestPositionRecord?.toDepartment || 'Not assigned',
        currentGrade: 1, // This should be fetched from personnel grade record
        currentStep: 1,  // This should be fetched from personnel grade record
        currentSalary: 0, // This should be calculated from pay scale
        lastPromotionDate: promotions.length > 0 ? promotions[promotions.length - 1].effectiveDate : undefined,
        nextEligiblePromotionDate: undefined, // Calculate based on promotion rules
        nextStepIncrementDate: undefined,     // Calculate based on step increment rules
        
        // Leave summary - these should be calculated from leave records
        annualLeaveBalance: 20, // Default - should be calculated
        medicalLeaveUsed: 0,    // Should be calculated from leave records
        casualLeaveBalance: 10,  // Default - should be calculated
        
        // Performance & Disciplinary
        performanceRating: undefined, // Should be fetched from performance records
        disciplinaryActions: disciplinary.length,
        awards: awards.length,
        trainingsCompleted: trainings.length,
        transferHistory: transfers.length,
        
        // Calculated fields
        pensionEligibilityDate: new Date(startDate.getTime() + (25 * 365 * 24 * 60 * 60 * 1000)), // 25 years service
        retirementDate: new Date(startDate.getTime() + (35 * 365 * 24 * 60 * 60 * 1000)), // 35 years service
        
        lastUpdated: new Date()
      };

      setSummary(calculatedSummary);
      
    } catch (err) {
      setError('Failed to calculate service summary');
      console.error('Error calculating service summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personnelId) {
      calculateServiceSummary(personnelId);
    }
  }, [personnelId]);

  return {
    summary,
    loading,
    error,
    refreshSummary: () => calculateServiceSummary(personnelId)
  };
};
