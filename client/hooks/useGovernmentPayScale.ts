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
  getDoc 
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { GovernmentPayScale, PersonnelGrade } from '@/types/government';

export const useGovernmentPayScale = () => {
  const [payScales, setPayScales] = useState<GovernmentPayScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayScales = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'governmentPayScales'), 
        where('isActive', '==', true),
        orderBy('grade', 'asc'),
        orderBy('step', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const scales: GovernmentPayScale[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scales.push({ 
          id: doc.id, 
          ...data,
          effectiveDate: data.effectiveDate?.toDate(),
          approvalDate: data.approvalDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as GovernmentPayScale);
      });
      
      setPayScales(scales);
    } catch (err) {
      setError('Failed to fetch pay scales');
      console.error('Error fetching pay scales:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPayScale = async (payScale: Omit<GovernmentPayScale, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Check if grade/step combination already exists
      const existing = payScales.find(scale => 
        scale.grade === payScale.grade && 
        scale.step === payScale.step && 
        scale.isActive
      );
      
      if (existing) {
        throw new Error(`Pay scale for Grade ${payScale.grade}, Step ${payScale.step} already exists`);
      }

      const docRef = await addDoc(collection(db, 'governmentPayScales'), {
        ...payScale,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await fetchPayScales(); // Refresh data
      return docRef.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create pay scale');
      console.error('Error creating pay scale:', err);
      throw err;
    }
  };

  const updatePayScale = async (id: string, updates: Partial<GovernmentPayScale>) => {
    try {
      const docRef = doc(db, 'governmentPayScales', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      await fetchPayScales(); // Refresh data
    } catch (err) {
      setError('Failed to update pay scale');
      console.error('Error updating pay scale:', err);
      throw err;
    }
  };

  const deletePayScale = async (id: string) => {
    try {
      // Soft delete - mark as inactive
      const docRef = doc(db, 'governmentPayScales', id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: new Date()
      });
      
      await fetchPayScales(); // Refresh data
    } catch (err) {
      setError('Failed to delete pay scale');
      console.error('Error deleting pay scale:', err);
      throw err;
    }
  };

  const getPayScaleByGradeStep = (grade: number, step: number): GovernmentPayScale | undefined => {
    return payScales.find(scale => scale.grade === grade && scale.step === step && scale.isActive);
  };

  const calculateTotalSalary = (grade: number, step: number): number => {
    const scale = getPayScaleByGradeStep(grade, step);
    if (!scale) return 0;

    return scale.basicSalary + 
           Object.values(scale.allowances).reduce((sum, val) => sum + val, 0) +
           Object.values(scale.benefits).reduce((sum, val) => sum + val, 0);
  };

  const getGradeStepMatrix = (): { [grade: number]: GovernmentPayScale[] } => {
    const matrix: { [grade: number]: GovernmentPayScale[] } = {};
    
    payScales.forEach(scale => {
      if (!matrix[scale.grade]) {
        matrix[scale.grade] = [];
      }
      matrix[scale.grade].push(scale);
    });

    // Sort steps within each grade
    Object.keys(matrix).forEach(grade => {
      matrix[parseInt(grade)].sort((a, b) => a.step - b.step);
    });

    return matrix;
  };

  const getNextStepSalary = (currentGrade: number, currentStep: number): number | null => {
    if (currentStep < 10) {
      return calculateTotalSalary(currentGrade, currentStep + 1);
    }
    return null; // No next step available
  };

  const getPromotionSalary = (currentGrade: number): number | null => {
    if (currentGrade < 20) {
      return calculateTotalSalary(currentGrade + 1, 1);
    }
    return null; // No promotion available
  };

  const validatePayScale = (payScale: Partial<GovernmentPayScale>): string[] => {
    const errors: string[] = [];

    if (!payScale.grade || payScale.grade < 1 || payScale.grade > 20) {
      errors.push('Grade must be between 1 and 20');
    }

    if (!payScale.step || payScale.step < 1 || payScale.step > 10) {
      errors.push('Step must be between 1 and 10');
    }

    if (!payScale.basicSalary || payScale.basicSalary <= 0) {
      errors.push('Basic salary must be greater than 0');
    }

    if (!payScale.effectiveDate) {
      errors.push('Effective date is required');
    }

    return errors;
  };

  const importPayScales = async (payScales: Omit<GovernmentPayScale, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      setLoading(true);
      const batch = [];
      
      for (const payScale of payScales) {
        const validationErrors = validatePayScale(payScale);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed for Grade ${payScale.grade}, Step ${payScale.step}: ${validationErrors.join(', ')}`);
        }
        
        batch.push(createPayScale(payScale));
      }
      
      await Promise.all(batch);
      await fetchPayScales();
    } catch (err) {
      setError('Failed to import pay scales');
      console.error('Error importing pay scales:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultPayScales = async () => {
    try {
      const defaultScales: Omit<GovernmentPayScale, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      
      // Generate basic pay scales for all grades and steps
      for (let grade = 1; grade <= 20; grade++) {
        for (let step = 1; step <= 10; step++) {
          // Basic salary calculation (this is just an example - adjust based on actual government scales)
          const baseSalary = 100000 + (grade * 50000) + (step * 5000);
          
          defaultScales.push({
            grade,
            step,
            basicSalary: baseSalary,
            effectiveDate: new Date(),
            allowances: {
              positionAllowance: Math.floor(baseSalary * 0.1),
              locationAllowance: Math.floor(baseSalary * 0.05),
              responsibilityAllowance: grade >= 15 ? Math.floor(baseSalary * 0.15) : 0,
              riskAllowance: 0,
              specialAllowance: 0
            },
            benefits: {
              medicalAllowance: 50000,
              transportAllowance: 30000,
              foodAllowance: 40000,
              familyAllowance: 25000,
              housingAllowance: grade >= 10 ? 75000 : 50000
            },
            isActive: true,
            createdBy: 'system',
            approvedBy: 'admin',
            approvalDate: new Date(),
            remarks: 'Default government pay scale'
          });
        }
      }
      
      await importPayScales(defaultScales);
    } catch (err) {
      setError('Failed to generate default pay scales');
      console.error('Error generating default pay scales:', err);
      throw err;
    }
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
    calculateTotalSalary,
    getGradeStepMatrix,
    getNextStepSalary,
    getPromotionSalary,
    validatePayScale,
    importPayScales,
    generateDefaultPayScales,
    refreshPayScales: fetchPayScales
  };
};

// Hook for managing personnel grades
export const usePersonnelGrade = (personnelId?: string) => {
  const [personnelGrade, setPersonnelGrade] = useState<PersonnelGrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonnelGrade = async (id: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'personnelGrades'),
        where('personnelId', '==', id)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setPersonnelGrade({
          id: doc.id,
          ...data,
          appointmentDate: data.appointmentDate?.toDate(),
          lastPromotionDate: data.lastPromotionDate?.toDate(),
          nextEligibleDate: data.nextEligibleDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          gradeHistory: data.gradeHistory?.map((h: any) => ({
            ...h,
            effectiveDate: h.effectiveDate?.toDate(),
            createdAt: h.createdAt?.toDate()
          })) || []
        } as PersonnelGrade);
      } else {
        setPersonnelGrade(null);
      }
    } catch (err) {
      setError('Failed to fetch personnel grade');
      console.error('Error fetching personnel grade:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonnelGrade = async (updates: Partial<PersonnelGrade>) => {
    try {
      if (!personnelGrade) return;
      
      const docRef = doc(db, 'personnelGrades', personnelGrade.id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      if (personnelId) {
        await fetchPersonnelGrade(personnelId);
      }
    } catch (err) {
      setError('Failed to update personnel grade');
      console.error('Error updating personnel grade:', err);
      throw err;
    }
  };

  const createPersonnelGrade = async (grade: Omit<PersonnelGrade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'personnelGrades'), {
        ...grade,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (personnelId) {
        await fetchPersonnelGrade(personnelId);
      }
      
      return docRef.id;
    } catch (err) {
      setError('Failed to create personnel grade');
      console.error('Error creating personnel grade:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (personnelId) {
      fetchPersonnelGrade(personnelId);
    }
  }, [personnelId]);

  return {
    personnelGrade,
    loading,
    error,
    fetchPersonnelGrade,
    updatePersonnelGrade,
    createPersonnelGrade
  };
};
