import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Download, Upload, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { useGovernmentPayScale } from '@/hooks/useGovernmentPayScale';
import { GovernmentPayScale } from '@/types/government';
import { useToast } from '@/hooks/use-toast';

export const GovernmentPayScaleManagement: React.FC = () => {
  const { payScales, loading, createPayScale, updatePayScale, deletePayScale, getGradeStepMatrix, generateDefaultPayScales } = useGovernmentPayScale();
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScale, setEditingScale] = useState<GovernmentPayScale | null>(null);
  const [newScale, setNewScale] = useState<Partial<GovernmentPayScale>>({
    grade: 1,
    step: 1,
    basicSalary: 0,
    allowances: {
      positionAllowance: 0,
      locationAllowance: 0,
      responsibilityAllowance: 0,
      riskAllowance: 0,
      specialAllowance: 0
    },
    benefits: {
      medicalAllowance: 50000,
      transportAllowance: 30000,
      foodAllowance: 40000,
      familyAllowance: 25000,
      housingAllowance: 50000
    },
    isActive: true,
    effectiveDate: new Date(),
    createdBy: 'admin',
    approvedBy: '',
    remarks: ''
  });

  const gradeMatrix = getGradeStepMatrix();

  const calculateTotalSalary = (scale: GovernmentPayScale): number => {
    const { basicSalary, allowances, benefits } = scale;
    return basicSalary + 
           Object.values(allowances).reduce((sum, val) => sum + val, 0) +
           Object.values(benefits).reduce((sum, val) => sum + val, 0);
  };

  const handleCreatePayScale = async () => {
    try {
      if (!newScale.grade || !newScale.step || !newScale.basicSalary) {
        toast({
          title: "Validation Error",
          description: "Grade, Step, and Basic Salary are required",
          variant: "destructive"
        });
        return;
      }

      await createPayScale(newScale as Omit<GovernmentPayScale, 'id' | 'createdAt' | 'updatedAt'>);
      
      toast({
        title: "Success",
        description: "Pay scale created successfully",
        variant: "default"
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pay scale",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePayScale = async () => {
    try {
      if (!editingScale) return;

      await updatePayScale(editingScale.id, newScale);
      
      toast({
        title: "Success",
        description: "Pay scale updated successfully",
        variant: "default"
      });
      
      setIsDialogOpen(false);
      setEditingScale(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pay scale",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayScale = async (id: string, grade: number, step: number) => {
    if (!confirm(`Are you sure you want to delete pay scale for Grade ${grade}, Step ${step}?`)) {
      return;
    }

    try {
      await deletePayScale(id);
      toast({
        title: "Success",
        description: "Pay scale deleted successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pay scale",
        variant: "destructive"
      });
    }
  };

  const handleGenerateDefaults = async () => {
    if (!confirm('This will generate default pay scales for all grades (1-20) and steps (1-10). Continue?')) {
      return;
    }

    try {
      await generateDefaultPayScales();
      toast({
        title: "Success",
        description: "Default pay scales generated successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate default pay scales",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewScale({
      grade: selectedGrade,
      step: 1,
      basicSalary: 0,
      allowances: {
        positionAllowance: 0,
        locationAllowance: 0,
        responsibilityAllowance: 0,
        riskAllowance: 0,
        specialAllowance: 0
      },
      benefits: {
        medicalAllowance: 50000,
        transportAllowance: 30000,
        foodAllowance: 40000,
        familyAllowance: 25000,
        housingAllowance: 50000
      },
      isActive: true,
      effectiveDate: new Date(),
      createdBy: 'admin',
      approvedBy: '',
      remarks: ''
    });
  };

  const openEditDialog = (scale: GovernmentPayScale) => {
    setEditingScale(scale);
    setNewScale({
      grade: scale.grade,
      step: scale.step,
      basicSalary: scale.basicSalary,
      allowances: { ...scale.allowances },
      benefits: { ...scale.benefits },
      isActive: scale.isActive,
      effectiveDate: scale.effectiveDate,
      createdBy: scale.createdBy,
      approvedBy: scale.approvedBy,
      remarks: scale.remarks
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingScale(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const currentGradeScales = gradeMatrix[selectedGrade] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading pay scales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Government Pay Scale Management</h1>
          <h2 className="text-2xl font-bold text-red-600 mt-1">အစိုးရ လစာစာရင်း စီမံခန့်ခွဲမှု</h2>
          <p className="text-gray-600 mt-2">Manage government employee pay scales by grade and step</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateDefaults} variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Generate Defaults
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pay Scale
          </Button>
        </div>
      </div>

      {payScales.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Pay Scales Found</AlertTitle>
          <AlertDescription>
            No government pay scales have been configured yet. Click "Generate Defaults" to create a basic structure.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedGrade.toString()} onValueChange={(value) => setSelectedGrade(parseInt(value))}>
        {/* Grade Selection Tabs */}
        <TabsList className="grid grid-cols-10 gap-1 h-auto p-1">
          {Array.from({length: 20}, (_, i) => i + 1).map(grade => (
            <TabsTrigger
              key={grade}
              value={grade.toString()}
              className="text-xs px-2 py-1"
            >
              Grade {grade}
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({length: 20}, (_, i) => i + 1).map(grade => (
          <TabsContent key={grade} value={grade.toString()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Grade {grade} Pay Scale / အဆင့် {grade} လစာစာရင်း</span>
                  <Badge variant="outline">
                    {currentGradeScales.length} steps configured
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Pay scale structure for government employees at Grade {grade}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentGradeScales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Position Allow.</TableHead>
                        <TableHead>Location Allow.</TableHead>
                        <TableHead>Medical Allow.</TableHead>
                        <TableHead>Transport Allow.</TableHead>
                        <TableHead className="font-bold">Total Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentGradeScales.map(scale => (
                        <TableRow key={`${scale.grade}-${scale.step}`}>
                          <TableCell className="font-medium">{scale.step}</TableCell>
                          <TableCell>{scale.basicSalary.toLocaleString()} MMK</TableCell>
                          <TableCell>{scale.allowances.positionAllowance.toLocaleString()} MMK</TableCell>
                          <TableCell>{scale.allowances.locationAllowance.toLocaleString()} MMK</TableCell>
                          <TableCell>{scale.benefits.medicalAllowance.toLocaleString()} MMK</TableCell>
                          <TableCell>{scale.benefits.transportAllowance.toLocaleString()} MMK</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {calculateTotalSalary(scale).toLocaleString()} MMK
                          </TableCell>
                          <TableCell>
                            <Badge variant={scale.isActive ? "default" : "secondary"}>
                              {scale.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(scale)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePayScale(scale.id, scale.grade, scale.step)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pay scales configured for Grade {grade}</p>
                    <Button 
                      onClick={openCreateDialog} 
                      className="mt-4"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Pay Scale for Grade {grade}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScale ? 'Edit Pay Scale' : 'Add New Pay Scale'}
            </DialogTitle>
            <DialogDescription>
              {editingScale 
                ? `Edit pay scale for Grade ${editingScale.grade}, Step ${editingScale.step}`
                : 'Create a new government pay scale entry'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Grade / အဆင့်</Label>
                <Select 
                  value={newScale.grade?.toString()} 
                  onValueChange={(value) => setNewScale({...newScale, grade: parseInt(value)})}
                  disabled={!!editingScale}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 20}, (_, i) => i + 1).map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Step / အဆင့်ခွဲ</Label>
                <Select 
                  value={newScale.step?.toString()} 
                  onValueChange={(value) => setNewScale({...newScale, step: parseInt(value)})}
                  disabled={!!editingScale}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => i + 1).map(step => (
                      <SelectItem key={step} value={step.toString()}>
                        Step {step}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Basic Salary (MMK)</Label>
                <Input
                  type="number"
                  value={newScale.basicSalary}
                  onChange={(e) => setNewScale({...newScale, basicSalary: parseInt(e.target.value)})}
                  placeholder="Enter basic salary"
                />
              </div>
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={newScale.effectiveDate ? new Date(newScale.effectiveDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewScale({...newScale, effectiveDate: new Date(e.target.value)})}
                />
              </div>
            </div>

            {/* Allowances */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Allowances / ထောက်ပံ့ကြေးများ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Position Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.allowances?.positionAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        allowances: {...newScale.allowances!, positionAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Location Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.allowances?.locationAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        allowances: {...newScale.allowances!, locationAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Responsibility Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.allowances?.responsibilityAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        allowances: {...newScale.allowances!, responsibilityAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Risk Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.allowances?.riskAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        allowances: {...newScale.allowances!, riskAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benefits / အကျိုးခံစားခွင့်များ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Medical Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.benefits?.medicalAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        benefits: {...newScale.benefits!, medicalAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Transport Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.benefits?.transportAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        benefits: {...newScale.benefits!, transportAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Food Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.benefits?.foodAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        benefits: {...newScale.benefits!, foodAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Family Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.benefits?.familyAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        benefits: {...newScale.benefits!, familyAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Housing Allowance (MMK)</Label>
                    <Input
                      type="number"
                      value={newScale.benefits?.housingAllowance}
                      onChange={(e) => setNewScale({
                        ...newScale, 
                        benefits: {...newScale.benefits!, housingAllowance: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Approved By</Label>
                <Input
                  value={newScale.approvedBy}
                  onChange={(e) => setNewScale({...newScale, approvedBy: e.target.value})}
                  placeholder="Enter approver name"
                />
              </div>
            </div>

            <div>
              <Label>Remarks</Label>
              <Textarea
                value={newScale.remarks}
                onChange={(e) => setNewScale({...newScale, remarks: e.target.value})}
                placeholder="Enter any additional remarks"
                rows={3}
              />
            </div>

            {/* Total Calculation Preview */}
            {newScale.basicSalary && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Total Salary Calculation</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div>Basic Salary: {newScale.basicSalary?.toLocaleString()} MMK</div>
                    <div>Total Allowances: {Object.values(newScale.allowances || {}).reduce((sum, val) => sum + val, 0).toLocaleString()} MMK</div>
                    <div>Total Benefits: {Object.values(newScale.benefits || {}).reduce((sum, val) => sum + val, 0).toLocaleString()} MMK</div>
                    <div className="font-bold text-green-600">
                      Total Monthly Salary: {(
                        (newScale.basicSalary || 0) + 
                        Object.values(newScale.allowances || {}).reduce((sum, val) => sum + val, 0) +
                        Object.values(newScale.benefits || {}).reduce((sum, val) => sum + val, 0)
                      ).toLocaleString()} MMK
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingScale ? handleUpdatePayScale : handleCreatePayScale}>
              {editingScale ? 'Update' : 'Create'} Pay Scale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernmentPayScaleManagement;
