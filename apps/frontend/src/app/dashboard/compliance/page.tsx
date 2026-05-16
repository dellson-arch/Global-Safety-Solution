"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Plus, Check, AlertCircle, Calendar, FileSearch, Briefcase, Hash, Clock, ShieldCheck, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  name: string;
}

interface Compliance {
  id: string;
  compliance_type: string;
  reference_number?: string;
  issue_date?: string;
  expiry_date?: string;
  renewal_cycle_days: number;
  status: string;
  client?: Client;
}

export default function CompliancePage() {
  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const token = useAuthStore((state) => state.token);

  const [formData, setFormData] = useState({
    client_id: "",
    compliance_type: "",
    reference_number: "",
    issue_date: "",
    expiry_date: "",
    renewal_cycle_days: 365,
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) {
      setTimeout(() => setLoading(false), 2000);
      return;
    }
    setLoading(true);
    try {
      // Parallel fetch for compliances and clients
      const [compRes, clientRes] = await Promise.all([
        fetch(`${API_BASE_URL}/compliance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const compData = await compRes.json();
      const clientData = await clientRes.json();

      if (Array.isArray(compData)) setCompliances(compData);
      if (Array.isArray(clientData)) setClients(clientData);

    } catch (e) {
      console.error("Data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          renewal_cycle_days: Number(formData.renewal_cycle_days),
          issue_date: formData.issue_date ? new Date(formData.issue_date).toISOString() : null,
          expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        })
      });

      if (res.ok) {
        setOpen(false);
        setFormData({
          client_id: "",
          compliance_type: "",
          reference_number: "",
          issue_date: "",
          expiry_date: "",
          renewal_cycle_days: 365,
          status: "ACTIVE"
        });
        fetchData();
      } else {
        const errorData = await res.json();
        setActionError(errorData.message || "Failed to record compliance.");
      }
    } catch (err: any) {
      setActionError(`Network Error: ${err?.message || 'Check connection'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCompliance || !uploadFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadFile.name);
      formData.append('file_type', 'PDF');
      formData.append('category', 'CERTIFICATE');
      formData.append('compliance_id', selectedCompliance);

      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setUploadOpen(false);
        setUploadFile(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Compliance & Registry
          </h1>
          <p className="text-muted-foreground text-sm">Monitor and manage institutional safety certifications.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 px-6 font-semibold transition-all hover:scale-105 active:scale-95" />
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Track New Compliance
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-card border-border text-foreground shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-500">Record Enterprise Compliance</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Register a new safety license, audit report, or institutional certificate.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateCompliance} className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* General Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Target Client *</Label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <select 
                        required
                        value={formData.client_id}
                        onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                        className="w-full pl-9 h-10 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                      >
                        <option value="">Select Organization</option>
                        {clients.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">Compliance Category *</Label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        required
                        placeholder="e.g. Fire Safety, ISO 9001"
                        value={formData.compliance_type}
                        onChange={(e) => setFormData({...formData, compliance_type: e.target.value})}
                        className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">Reference / License Number</Label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        placeholder="REF-12345-X"
                        value={formData.reference_number}
                        onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                        className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Lifecycle Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/80">Issue Date</Label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input 
                          type="date"
                          value={formData.issue_date}
                          onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                          className="pl-9 bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/80">Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input 
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                          className="pl-9 bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">Renewal Cycle (Days)</Label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        type="number"
                        value={formData.renewal_cycle_days}
                        onChange={(e) => setFormData({...formData, renewal_cycle_days: Number(e.target.value)})}
                        className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">Initial Status</Label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full h-10 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none px-3"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                </div>
              </div>

              {actionError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {actionError}
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-border">
                <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent/5">
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 shadow-lg shadow-emerald-500/20 font-bold"
                >
                  {submitting ? 'Processing...' : 'Authorize Compliance'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Upload Compliance Document</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Attach the official certificate or report for this compliance record.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Document File (PDF/Image)</Label>
                <Input 
                  type="file" 
                  accept=".pdf,image/*" 
                  required
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !uploadFile} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border overflow-hidden shadow-2xl">
        <table className="w-full text-left font-medium border-collapse">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-border font-semibold">Organization</th>
              <th className="px-6 py-4 border-b border-border font-semibold">Compliance Type</th>
              <th className="px-6 py-4 border-b border-border font-semibold">Reference</th>
              <th className="px-6 py-4 border-b border-border font-semibold">Expiry Schedule</th>
              <th className="px-6 py-4 border-b border-border font-semibold">Status</th>
              <th className="px-6 py-4 border-b border-border text-right font-semibold">Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {loading ? (
               <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Synchronizing with registry...</td></tr>
            ) : compliances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-20 text-muted-foreground">
                    <FileSearch className="w-12 h-12" />
                    <p className="text-lg">No enterprise compliance records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              compliances.map((c: any) => (
                <tr key={c.id} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {c.client?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-foreground/80">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {c.compliance_type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-muted-foreground tracking-tighter uppercase">{c.reference_number || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-foreground/80">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Indefinite'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-0.5">Renews every {c.renewal_cycle_days} days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ${
                      c.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 ring-rose-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedCompliance(c.id); setUploadOpen(true); }} className="h-8 w-8 p-0 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                        <UploadCloud className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/5">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

  );
}

