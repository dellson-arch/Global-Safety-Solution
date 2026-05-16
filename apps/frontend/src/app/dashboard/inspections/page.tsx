"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Camera,
  Check,
  X,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InspectionItem {
  id: string;
  description: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'NA';
  notes?: string;
}

interface Inspection {
  id: string;
  client: { name: string };
  engineer?: { name: string };
  scheduled_date: string;
  status: string;
  items: InspectionItem[];
  lat?: number;
  lng?: number;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openVisit, setOpenVisit] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  
  const [scheduleForm, setScheduleForm] = useState({
    client_id: "",
    engineer_id: "",
    scheduled_date: new Date().toISOString().split('T')[0],
    items: [{ description: "General Safety Check" }]
  });

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [iRes, cRes, eRes] = await Promise.all([
        fetch(`${API_BASE_URL}/inspections`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }) // Changed from /employees to /users as per schema
      ]);
      const [iData, cData, eData] = await Promise.all([iRes.json(), cRes.json(), eRes.json()]);
      
      if (Array.isArray(iData)) setInspections(iData);
      if (Array.isArray(cData)) setClients(cData);
      if (Array.isArray(eData)) setEngineers(eData.filter((u: any) => u.designation?.toLowerCase().includes('engineer') || u.name.includes('Admin'))); // Filter for engineers or admin for demo
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(scheduleForm)
      });
      if (res.ok) {
        setOpenSchedule(false);
        toast.success("Inspection scheduled successfully");
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to schedule inspection");
    }
  };

  const handleUpdateItem = async (itemId: string, status: string, notes?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/inspections/item/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        // Update local state
        if (selectedInspection) {
          const updatedItems = selectedInspection.items.map(item => 
            item.id === itemId ? { ...item, status: status as any, notes } : item
          );
          setSelectedInspection({ ...selectedInspection, items: updatedItems });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteVisit = async () => {
    if (!token || !selectedInspection) return;
    
    // Capture GPS
    let lat = 0;
    let lng = 0;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/inspections/${selectedInspection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          status: 'COMPLETED', 
          completed_date: new Date().toISOString(),
          lat,
          lng
        })
      });
      if (res.ok) {
        setOpenVisit(false);
        toast.success("Visit marked as completed with site verification");
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to complete visit");
    }
  };

  const handleDownloadCertificate = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/inspections/${id}/certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `safety-certificate-${id.substring(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      toast.error("Failed to download certificate");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Site Inspections
          </h1>
          <p className="text-muted-foreground font-medium">Manage field safety audits, engineer visits, and checklists.</p>
        </div>

        <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
          <DialogTrigger render={
            <Button className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-500/20 px-8 h-12 transition-all active:scale-95">
              <Plus className="w-5 h-5 mr-2" /> Schedule Visit
            </Button>
          } />
          <DialogContent className="sm:max-w-[600px] bg-card border-border rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Schedule Safety Audit</DialogTitle>
              <DialogDescription>Assign an engineer and set the inspection scope.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Client</Label>
                  <select 
                    required
                    value={scheduleForm.client_id}
                    onChange={(e) => setScheduleForm({...scheduleForm, client_id: e.target.value})}
                    className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm"
                  >
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Engineer</Label>
                  <select 
                    required
                    value={scheduleForm.engineer_id}
                    onChange={(e) => setScheduleForm({...scheduleForm, engineer_id: e.target.value})}
                    className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm"
                  >
                    <option value="">Select engineer...</option>
                    {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Input 
                    type="date"
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduled_date: e.target.value})}
                    className="h-11 bg-background border-border"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20">
                  Confirm Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inspection Stats */}
        <div className="bg-card/40 border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Scheduled</span>
          </div>
          <p className="text-3xl font-black text-foreground">{inspections.filter(i => i.status === 'SCHEDULED').length}</p>
        </div>
        <div className="bg-card/40 border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">In Progress</span>
          </div>
          <p className="text-3xl font-black text-foreground">{inspections.filter(i => i.status === 'IN_PROGRESS').length}</p>
        </div>
        <div className="bg-card/40 border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-3xl font-black text-foreground">{inspections.filter(i => i.status === 'COMPLETED').length}</p>
        </div>
      </div>

      <div className="bg-card/40 border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-blue-600" /> Recent Audits
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input className="bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none w-64" placeholder="Search audits..." />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client & Location</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engineer</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schedule</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-muted-foreground animate-pulse">Syncing field data...</td></tr>
              ) : inspections.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">No site inspections found.</td></tr>
              ) : (
                inspections.map((i) => (
                  <tr key={i.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">{i.client?.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Site Verified: {i.lat ? "Yes" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{i.engineer?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(i.scheduled_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1", 
                        i.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' :
                        i.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-600 ring-blue-500/20' :
                        'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                      )}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {i.status === 'COMPLETED' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => handleDownloadCertificate(i.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          className="h-9 px-4 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-500/10"
                          onClick={() => {
                            setSelectedInspection(i);
                            setOpenVisit(true);
                          }}
                        >
                          {i.status === 'COMPLETED' ? 'View Details' : 'Start Visit'} <ChevronRight className="w-4 h-4 ml-1" />
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

      {/* Field Visit Dialog */}
      <Dialog open={openVisit} onOpenChange={setOpenVisit}>
        <DialogContent className="sm:max-w-[700px] bg-card border-border rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
          {selectedInspection && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <ClipboardCheck className="w-6 h-6 text-blue-600" /> Inspection Checklist
                </DialogTitle>
                <DialogDescription>
                  Site Visit for <span className="font-bold text-foreground">{selectedInspection.client?.name}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedInspection.items.map((item) => (
                  <div key={item.id} className="p-5 bg-muted/20 border border-border rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{item.description}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant={item.status === 'PASS' ? 'default' : 'outline'} 
                          className={cn("h-8 rounded-lg", item.status === 'PASS' && "bg-emerald-600 hover:bg-emerald-500")}
                          onClick={() => handleUpdateItem(item.id, 'PASS')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={item.status === 'FAIL' ? 'destructive' : 'outline'} 
                          className="h-8 rounded-lg"
                          onClick={() => handleUpdateItem(item.id, 'FAIL')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Input 
                      placeholder="Add observations..." 
                      className="bg-background h-10 text-sm"
                      value={item.notes || ""}
                      onChange={(e) => handleUpdateItem(item.id, item.status, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                <Camera className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Site Verification Required</p>
                  <p className="text-[10px] text-muted-foreground uppercase">GPS Coordinates will be captured on completion</p>
                </div>
                <Button variant="outline" className="rounded-xl h-10 border-blue-500/20 text-blue-600">
                  Upload Photo
                </Button>
              </div>

              <DialogFooter className="pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setOpenVisit(false)}>Discard</Button>
                <Button 
                  disabled={selectedInspection.status === 'COMPLETED'}
                  onClick={handleCompleteVisit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {selectedInspection.status === 'COMPLETED' ? 'Already Completed' : 'Complete Audit & Sign Off'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
