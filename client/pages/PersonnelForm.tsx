import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  PersonnelFormData,
  DEFAULT_RANKS,
  DEFAULT_ORGANIZATIONS,
  PersonnelStatus,
  getStatusInEnglish,
} from "@shared/personnel";
import { TerminationReason } from "../../shared/hr-system";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addPersonnel, updatePersonnel } = useApp();
  const isEditing = !!id;

  const [formData, setFormData] = useState<PersonnelFormData>({
    id: "",
    name: "",
    rank: "",
    dateOfJoining: "",
    dateOfLeaving: "",
    assignedDuties: "",
    status: "active",
    organization: "",
  });

  const [terminationData, setTerminationData] = useState({
    terminationReason: "" as TerminationReason | "",
    terminationNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existing = state.personnel.find((p) => p.id === id);
      if (existing) {
        setFormData({
          id: existing.id,
          name: existing.name,
          rank: existing.rank,
          dateOfJoining: existing.dateOfJoining.split("T")[0], // Convert to date input format
          dateOfLeaving: existing.dateOfLeaving
            ? existing.dateOfLeaving.split("T")[0]
            : "",
          assignedDuties: existing.assignedDuties,
          status: existing.status,
          organization: existing.organization,
        });
      } else {
        navigate("/dashboard");
      }
    }
  }, [isEditing, id, state.personnel, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = "Personnel ID is required";
    } else if (
      !isEditing &&
      state.personnel.some((p) => p.id === formData.id)
    ) {
      newErrors.id = "Personnel ID already exists";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.rank.trim()) {
      newErrors.rank = "Rank is required";
    }

    if (!formData.dateOfJoining) {
      newErrors.dateOfJoining = "Date of joining is required";
    }

    if (!formData.assignedDuties.trim()) {
      newErrors.assignedDuties = "Assigned duties are required";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    }

    if (
      formData.dateOfLeaving &&
      formData.dateOfJoining &&
      new Date(formData.dateOfLeaving) < new Date(formData.dateOfJoining)
    ) {
      newErrors.dateOfLeaving = "Date of leaving cannot be before joining date";
    }

    // Validation for terminated or deceased status
    if (
      (formData.status === "terminated" || formData.status === "deceased") &&
      !formData.dateOfLeaving
    ) {
      newErrors.dateOfLeaving =
        "Date of leaving is required for terminated or deceased personnel";
    }

    if (
      formData.status === "terminated" &&
      !terminationData.terminationReason
    ) {
      newErrors.terminationReason = "Termination reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        dateOfJoining: new Date(formData.dateOfJoining).toISOString(),
        dateOfLeaving: formData.dateOfLeaving
          ? new Date(formData.dateOfLeaving).toISOString()
          : undefined,
      };

      if (isEditing) {
        const existing = state.personnel.find((p) => p.id === id);
        if (existing) {
          await updatePersonnel({
            ...existing,
            ...submitData,
          });
        }
      } else {
        await addPersonnel(submitData);
      }

      navigate("/dashboard");
    } catch (error) {
      setErrors({
        submit: "Failed to save personnel record. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof PersonnelFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-myanmar-black">
                {isEditing ? "Edit Personnel" : "Add New Personnel"}
              </h1>
              <p className="text-sm text-myanmar-gray-dark">
                PDF-Tech Personnel Management System
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-myanmar-red/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-myanmar-red" />
              <h2 className="text-xl font-semibold text-myanmar-black">
                {isEditing ? "Edit Personnel Record" : "Personnel Information"}
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-myanmar-black">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange("status", value as PersonnelStatus)
                    }
                  >
                    <SelectTrigger
                      className={`border-myanmar-red/30 focus:border-myanmar-red ${
                        errors.status ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {getStatusInEnglish("active")}
                      </SelectItem>
                      <SelectItem value="resigned">
                        {getStatusInEnglish("resigned")}
                      </SelectItem>
                      <SelectItem value="terminated">
                        {getStatusInEnglish("terminated")}
                      </SelectItem>
                      <SelectItem value="deceased">
                        {getStatusInEnglish("deceased")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-myanmar-black">
                    Organization *
                  </Label>
                  <Select
                    value={formData.organization}
                    onValueChange={(value) =>
                      handleChange("organization", value)
                    }
                  >
                    <SelectTrigger
                      className={`border-myanmar-red/30 focus:border-myanmar-red ${
                        errors.organization ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_ORGANIZATIONS.map((org) => (
                        <SelectItem key={org.name} value={org.name}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organization && (
                    <p className="text-sm text-red-500">
                      {errors.organization}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-myanmar-black">
                    Personnel ID *
                  </Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    placeholder="e.g., P14034"
                    className={`border-myanmar-red/30 focus:border-myanmar-red ${
                      errors.id ? "border-red-500" : ""
                    }`}
                    disabled={isEditing}
                  />
                  {errors.id && (
                    <p className="text-sm text-red-500">{errors.id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-myanmar-black">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={`border-myanmar-red/30 focus:border-myanmar-red ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rank" className="text-myanmar-black">
                    Rank/Position *
                  </Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => handleChange("rank", value)}
                  >
                    <SelectTrigger
                      className={`border-myanmar-red/30 focus:border-myanmar-red ${
                        errors.rank ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_RANKS.map((rank) => (
                        <SelectItem key={rank.name} value={rank.name}>
                          {rank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rank && (
                    <p className="text-sm text-red-500">{errors.rank}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining" className="text-myanmar-black">
                    Date of Joining *
                  </Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) =>
                      handleChange("dateOfJoining", e.target.value)
                    }
                    className={`border-myanmar-red/30 focus:border-myanmar-red ${
                      errors.dateOfJoining ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dateOfJoining && (
                    <p className="text-sm text-red-500">
                      {errors.dateOfJoining}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfLeaving" className="text-myanmar-black">
                    Date of Leaving{" "}
                    {(formData.status === "terminated" ||
                      formData.status === "deceased" ||
                      formData.status === "resigned") &&
                      "*"}
                  </Label>
                  <Input
                    id="dateOfLeaving"
                    type="date"
                    value={formData.dateOfLeaving}
                    onChange={(e) =>
                      handleChange("dateOfLeaving", e.target.value)
                    }
                    className={`border-myanmar-red/30 focus:border-myanmar-red ${
                      errors.dateOfLeaving ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dateOfLeaving && (
                    <p className="text-sm text-red-500">
                      {errors.dateOfLeaving}
                    </p>
                  )}
                  <p className="text-sm text-myanmar-gray-dark">
                    {formData.status === "active"
                      ? "Leave blank if person is still active"
                      : "Required for non-active personnel"}
                  </p>
                </div>

                {formData.status === "terminated" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="terminationReason"
                      className="text-myanmar-black"
                    >
                      Termination Reason *
                    </Label>
                    <Select
                      value={terminationData.terminationReason}
                      onValueChange={(value) =>
                        setTerminationData((prev) => ({
                          ...prev,
                          terminationReason: value as TerminationReason,
                        }))
                      }
                    >
                      <SelectTrigger
                        className={`border-myanmar-red/30 focus:border-myanmar-red ${
                          errors.terminationReason ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select termination reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disciplinary">
                          Disciplinary Action
                        </SelectItem>
                        <SelectItem value="performance">
                          Performance Issues
                        </SelectItem>
                        <SelectItem value="redundancy">Redundancy</SelectItem>
                        <SelectItem value="end-of-contract">
                          End of Contract
                        </SelectItem>
                        <SelectItem value="abandonment">
                          Job Abandonment
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.terminationReason && (
                      <p className="text-sm text-red-500">
                        {errors.terminationReason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedDuties" className="text-myanmar-black">
                  Assigned Duties *
                </Label>
                <Textarea
                  id="assignedDuties"
                  value={formData.assignedDuties}
                  onChange={(e) =>
                    handleChange("assignedDuties", e.target.value)
                  }
                  placeholder="Describe specific responsibilities and duties..."
                  rows={4}
                  className={`border-myanmar-red/30 focus:border-myanmar-red ${
                    errors.assignedDuties ? "border-red-500" : ""
                  }`}
                />
                {errors.assignedDuties && (
                  <p className="text-sm text-red-500">
                    {errors.assignedDuties}
                  </p>
                )}
              </div>

              {formData.status === "terminated" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="terminationNotes"
                    className="text-myanmar-black"
                  >
                    Termination Notes (Optional)
                  </Label>
                  <Textarea
                    id="terminationNotes"
                    value={terminationData.terminationNotes}
                    onChange={(e) =>
                      setTerminationData((prev) => ({
                        ...prev,
                        terminationNotes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about the termination..."
                    rows={3}
                    className="border-myanmar-red/30 focus:border-myanmar-red"
                  />
                  <p className="text-sm text-myanmar-gray-dark">
                    Provide additional context or details about the termination
                  </p>
                </div>
              )}

              {errors.submit && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {errors.submit}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-myanmar-red/20">
                <Link to="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading
                    ? "Saving..."
                    : isEditing
                      ? "Update Personnel"
                      : "Add Personnel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
