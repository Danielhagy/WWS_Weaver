import React, { useState, useEffect } from "react";
import { WorkdayCredential } from "@/entities/WorkdayCredential";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, CheckCircle, XCircle, Loader2, Edit2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATA_CENTERS = [
  { value: "WD2", label: "WD2" },
  { value: "WD5", label: "WD5" }
];

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tenant_name: "",
    username: "",
    password: "",
    data_center: "WD2"
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setIsLoading(true);
    const data = await WorkdayCredential.list("-created_date");
    setCredentials(data);
    setIsLoading(false);
  };

  const handleEdit = (cred) => {
    setEditingId(cred.id);
    setFormData({
      tenant_name: cred.tenant_name,
      username: cred.username,
      password: "", // Don't populate password for security
      data_center: cred.data_center
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      await WorkdayCredential.delete(id);
      loadCredentials();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Format username with @TenantName appended
    const formattedUsername = `${formData.username}@${formData.tenant_name}`;

    // Mock encryption
    const encrypted = btoa(formData.password);

    const credentialData = {
      tenant_name: formData.tenant_name,
      username: formData.username,
      isu_username: formattedUsername, // Store formatted username for webservice
      isu_password_encrypted: encrypted,
      data_center: formData.data_center,
      tenant_url: `https://${formData.data_center.toLowerCase()}-impl-services1.workday.com/ccx/service/${formData.tenant_name}`,
      is_active: true,
      last_validated: new Date().toISOString()
    };

    if (editingId) {
      await WorkdayCredential.update(editingId, credentialData);
    } else {
      await WorkdayCredential.create(credentialData);
    }

    setFormData({
      tenant_name: "",
      username: "",
      password: "",
      data_center: "WD2"
    });
    setShowForm(false);
    setEditingId(null);
    setIsSaving(false);
    loadCredentials();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workday Credentials</h1>
              <p className="text-gray-600 mt-1">Manage your Integration System User credentials</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Credentials
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>{editingId ? "Edit" : "New"} Workday Credentials</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> The username will be automatically formatted as username@tenant_name for the web service.
                  </p>
                </div>

                <div>
                  <Label htmlFor="tenant_name">Tenant Name *</Label>
                  <Input
                    id="tenant_name"
                    placeholder="e.g., acme_corp"
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used to build the tenant URL</p>
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="ISU_Integration_User"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be formatted as: {formData.username || "username"}@{formData.tenant_name || "tenant_name"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data_center">Data Center *</Label>
                  <Select
                    value={formData.data_center}
                    onValueChange={(value) => setFormData({ ...formData, data_center: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data center" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_CENTERS.map((dc) => (
                        <SelectItem key={dc.value} value={dc.value}>
                          {dc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Base URL: https://{(formData.data_center || "wd2").toLowerCase()}-impl-services1.workday.com/ccx/service/{formData.tenant_name || "tenant_name"}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ tenant_name: "", username: "", password: "", data_center: "WD2" });
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update Credentials" : "Save Credentials"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <div className="grid gap-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </CardContent>
            </Card>
          ) : credentials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Credentials Configured
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your Workday ISU credentials to start using integrations
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Credentials
                </Button>
              </CardContent>
            </Card>
          ) : (
            credentials.map((cred) => (
              <Card key={cred.id} className="border-none shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-green-500 rounded-lg flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cred.tenant_name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{cred.tenant_url}</p>
                      </div>
                    </div>
                    <Badge className={cred.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}>
                      {cred.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Data Center</p>
                      <p className="font-medium text-gray-900 mt-1">{cred.data_center}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-900 mt-1">{cred.username || cred.isu_username?.split('@')[0]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Formatted Username (for API)</p>
                      <p className="font-medium text-gray-900 mt-1">{cred.isu_username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium text-gray-900 mt-1">••••••••</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cred)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cred.id)}
                      className="flex-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}