import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Rank,
  Organization,
  DEFAULT_RANKS,
  DEFAULT_ORGANIZATIONS,
} from "@shared/personnel";
import { translations } from "@shared/translations";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Shield,
  Save,
  X,
} from "lucide-react";

interface SettingsState {
  ranks: Rank[];
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
}

export default function Settings() {
  const { state } = useApp();
  const [settings, setSettings] = useState<SettingsState>({
    ranks: [],
    organizations: [],
    isLoading: false,
    error: null,
  });

  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isAddingRank, setIsAddingRank] = useState(false);
  const [isAddingOrg, setIsAddingOrg] = useState(false);

  const [rankForm, setRankForm] = useState({ name: "", order: 1 });
  const [orgForm, setOrgForm] = useState({
    name: "",
    type: "headquarters" as const,
    parentId: "",
  });

  // Check if user has admin access
  const isAdmin = state.user?.role === "admin";

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setSettings((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // In production, this would load from Firebase
      // For now, load from localStorage or use defaults
      const savedRanks = localStorage.getItem("pdf-ranks");
      const savedOrgs = localStorage.getItem("pdf-organizations");

      const ranks = savedRanks
        ? JSON.parse(savedRanks)
        : DEFAULT_RANKS.map((rank, index) => ({
            ...rank,
            id: `rank-${index + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

      const organizations = savedOrgs
        ? JSON.parse(savedOrgs)
        : DEFAULT_ORGANIZATIONS.map((org, index) => ({
            ...org,
            id: `org-${index + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

      setSettings({
        ranks,
        organizations,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: "ဆက်တင်များ ရယူ၍မရပါ",
      }));
    }
  };

  const saveSettings = () => {
    localStorage.setItem("pdf-ranks", JSON.stringify(settings.ranks));
    localStorage.setItem(
      "pdf-organizations",
      JSON.stringify(settings.organizations),
    );
  };

  const handleAddRank = () => {
    if (!rankForm.name.trim()) return;

    const newRank: Rank = {
      id: `rank-${Date.now()}`,
      name: rankForm.name,
      order: rankForm.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSettings((prev) => ({
      ...prev,
      ranks: [...prev.ranks, newRank].sort((a, b) => a.order - b.order),
    }));

    setRankForm({ name: "", order: 1 });
    setIsAddingRank(false);
    saveSettings();
  };

  const handleEditRank = (rank: Rank) => {
    setRankForm({ name: rank.name, order: rank.order });
    setEditingRank(rank);
  };

  const handleUpdateRank = () => {
    if (!editingRank || !rankForm.name.trim()) return;

    const updatedRank: Rank = {
      ...editingRank,
      name: rankForm.name,
      order: rankForm.order,
      updatedAt: new Date().toISOString(),
    };

    setSettings((prev) => ({
      ...prev,
      ranks: prev.ranks
        .map((r) => (r.id === editingRank.id ? updatedRank : r))
        .sort((a, b) => a.order - b.order),
    }));

    setEditingRank(null);
    setRankForm({ name: "", order: 1 });
    saveSettings();
  };

  const handleDeleteRank = (rankId: string) => {
    if (window.confirm(translations.messages.confirmDelete)) {
      setSettings((prev) => ({
        ...prev,
        ranks: prev.ranks.filter((r) => r.id !== rankId),
      }));
      saveSettings();
    }
  };

  const handleAddOrganization = () => {
    if (!orgForm.name.trim()) return;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: orgForm.name,
      type: orgForm.type,
      parentId: orgForm.parentId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSettings((prev) => ({
      ...prev,
      organizations: [...prev.organizations, newOrg],
    }));

    setOrgForm({ name: "", type: "headquarters", parentId: "" });
    setIsAddingOrg(false);
    saveSettings();
  };

  const handleEditOrganization = (org: Organization) => {
    setOrgForm({
      name: org.name,
      type: org.type,
      parentId: org.parentId || "",
    });
    setEditingOrg(org);
  };

  const handleUpdateOrganization = () => {
    if (!editingOrg || !orgForm.name.trim()) return;

    const updatedOrg: Organization = {
      ...editingOrg,
      name: orgForm.name,
      type: orgForm.type,
      parentId: orgForm.parentId || undefined,
      updatedAt: new Date().toISOString(),
    };

    setSettings((prev) => ({
      ...prev,
      organizations: prev.organizations.map((o) =>
        o.id === editingOrg.id ? updatedOrg : o,
      ),
    }));

    setEditingOrg(null);
    setOrgForm({ name: "", type: "headquarters", parentId: "" });
    saveSettings();
  };

  const handleDeleteOrganization = (orgId: string) => {
    if (window.confirm(translations.messages.confirmDelete)) {
      setSettings((prev) => ({
        ...prev,
        organizations: prev.organizations.filter((o) => o.id !== orgId),
      }));
      saveSettings();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-myanmar-gray-light flex items-center justify-center">
        <Card className="border-myanmar-red/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-myanmar-red mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-myanmar-black mb-2">
              {translations.settings.adminOnly}
            </h2>
            <p className="text-myanmar-gray-dark mb-6">
              ဤစာမျက်နှာကို စီမံခန့်ခွဲသူများသာ ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်။
            </p>
            <Link to="/dashboard">
              <Button className="bg-myanmar-red hover:bg-myanmar-red-dark text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {translations.nav.back}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {translations.nav.back}
              </Button>
            </Link>
            <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-myanmar-black">
                {translations.settings.title}
              </h1>
              <p className="text-sm text-myanmar-gray-dark">
                {translations.subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {settings.error && (
          <Alert className="border-myanmar-red/50 bg-myanmar-red/10 mb-6">
            <AlertDescription className="text-myanmar-red-dark">
              {settings.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ranks Management */}
          <Card className="border-myanmar-red/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5 text-myanmar-red" />
                  <h3 className="text-lg font-semibold text-myanmar-black">
                    {translations.settings.manageRanks}
                  </h3>
                </div>
                <Dialog open={isAddingRank} onOpenChange={setIsAddingRank}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {translations.settings.addRank}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{translations.settings.addRank}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rank-name">ရာထူးအမည်</Label>
                        <Input
                          id="rank-name"
                          value={rankForm.name}
                          onChange={(e) =>
                            setRankForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="ရာထူးအမည် ထည့်ရန်"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rank-order">အစဉ်လိုက်နံပါတ်</Label>
                        <Input
                          id="rank-order"
                          type="number"
                          value={rankForm.order}
                          onChange={(e) =>
                            setRankForm((prev) => ({
                              ...prev,
                              order: parseInt(e.target.value) || 1,
                            }))
                          }
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleAddRank}
                          className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {translations.actions.save}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingRank(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {translations.actions.cancel}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>အစဉ်</TableHead>
                    <TableHead>ရာထူးအမည်</TableHead>
                    <TableHead>လုပ်ဆောင်ချက်များ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.ranks.map((rank) => (
                    <TableRow key={rank.id}>
                      <TableCell>{rank.order}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rank.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRank(rank)}
                            className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRank(rank.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Organizations Management */}
          <Card className="border-myanmar-red/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5 text-myanmar-red" />
                  <h3 className="text-lg font-semibold text-myanmar-black">
                    {translations.settings.manageOrganizations}
                  </h3>
                </div>
                <Dialog open={isAddingOrg} onOpenChange={setIsAddingOrg}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {translations.settings.addOrganization}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {translations.settings.addOrganization}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="org-name">အဖွဲ့အစည်းအမည်</Label>
                        <Input
                          id="org-name"
                          value={orgForm.name}
                          onChange={(e) =>
                            setOrgForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="အဖွဲ့အစည်းအမည် ထည့်ရန်"
                        />
                      </div>
                      <div>
                        <Label htmlFor="org-type">အမျိုးအစား</Label>
                        <Select
                          value={orgForm.type}
                          onValueChange={(value: any) =>
                            setOrgForm((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="headquarters">
                              ဌာနချုပ်
                            </SelectItem>
                            <SelectItem value="region">တိုင်း</SelectItem>
                            <SelectItem value="township">မြို့နယ်</SelectItem>
                            <SelectItem value="ward">တိုက်နယ်</SelectItem>
                            <SelectItem value="village">ရပ်ကျေး</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleAddOrganization}
                          className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {translations.actions.save}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingOrg(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {translations.actions.cancel}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>အမည်</TableHead>
                    <TableHead>အမျိုးအစား</TableHead>
                    <TableHead>လုပ်ဆောင်ချက်များ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {org.type === "headquarters" && "ဌာနချုပ်"}
                          {org.type === "region" && "တိုင်း"}
                          {org.type === "township" && "မြို့နယ်"}
                          {org.type === "ward" && "တိုက်နယ်"}
                          {org.type === "village" && "ရပ်ကျေး"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrganization(org)}
                            className="border-myanmar-red text-myanmar-red hover:bg-myanmar-red hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Edit Rank Dialog */}
        <Dialog open={!!editingRank} onOpenChange={() => setEditingRank(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ရာထူးပြင်ဆင်ရန်</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-rank-name">ရာထူးအမည်</Label>
                <Input
                  id="edit-rank-name"
                  value={rankForm.name}
                  onChange={(e) =>
                    setRankForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-rank-order">အစဉ်လိုက်နံပါတ်</Label>
                <Input
                  id="edit-rank-order"
                  type="number"
                  value={rankForm.order}
                  onChange={(e) =>
                    setRankForm((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateRank}
                  className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {translations.actions.update}
                </Button>
                <Button variant="outline" onClick={() => setEditingRank(null)}>
                  <X className="w-4 h-4 mr-2" />
                  {translations.actions.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Organization Dialog */}
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>အဖွဲ့အစည်းပြင်ဆင်ရန်</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-org-name">အဖွဲ့အစည်းအမည်</Label>
                <Input
                  id="edit-org-name"
                  value={orgForm.name}
                  onChange={(e) =>
                    setOrgForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-org-type">အမျိုးအစား</Label>
                <Select
                  value={orgForm.type}
                  onValueChange={(value: any) =>
                    setOrgForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headquarters">ဌာနချုပ်</SelectItem>
                    <SelectItem value="region">တိုင်း</SelectItem>
                    <SelectItem value="township">မြို့နယ်</SelectItem>
                    <SelectItem value="ward">တိုက်နယ်</SelectItem>
                    <SelectItem value="village">ရပ်ကျေး</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateOrganization}
                  className="bg-myanmar-red hover:bg-myanmar-red-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {translations.actions.update}
                </Button>
                <Button variant="outline" onClick={() => setEditingOrg(null)}>
                  <X className="w-4 h-4 mr-2" />
                  {translations.actions.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
