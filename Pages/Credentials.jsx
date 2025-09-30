import React, { useState, useEffect } from "react";
import { WorkdayCredential } from "@/entities/WorkdayCredential";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    tenant_name: "",
    tenant_url: "",
    isu_username: "",
    isu_password_encrypted: ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Mock encryption
    const encrypted = btoa(formData.isu_password_encrypted);
    
    await WorkdayCredential.create({
      ...formData,
      isu_password_encrypted: encrypted,
      is_active: true,
      last_validated: new Date().toISOString()
    });

    setFormData({
      tenant_name: "",
      tenant_url: "",
      isu_username: "",
      isu_password_encrypted: ""
    });
    setShowForm(false);
    setIsSaving(false);
    loadCredentials();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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

        {showForm && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>New Workday Credentials</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> In production, these credentials would be encrypted 
                    at rest and transmitted securely. This is a visual prototype.
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
                </div>

                <div>
                  <Label htmlFor="tenant_url">Tenant URL *</Label>
                  <Input
                    id="tenant_url"
                    type="url"
                    placeholder="https://your-tenant.workday.com"
                    value={formData.tenant_url}
                    onChange={(e) => setFormData({ ...formData, tenant_url: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="isu_username">ISU Username *</Label>
                  <Input
                    id="isu_username"
                    placeholder="ISU_Integration_User@tenant"
                    value={formData.isu_username}
                    onChange={(e) => setFormData({ ...formData, isu_username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="isu_password">ISU Password *</Label>
                  <Input
                    id="isu_password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.isu_password_encrypted}
                    onChange={(e) => setFormData({ ...formData, isu_password_encrypted: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
                    "Save Credentials"
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ISU Username</p>
                      <p className="font-medium text-gray-900 mt-1">{cred.isu_username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium text-gray-900 mt-1">••••••••</p>
                    </div>
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