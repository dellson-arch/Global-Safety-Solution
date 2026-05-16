"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Camera,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Task {
  id: string;
  status: string;
  scheduled_date: string;
  client: { name: string; city?: string };
  work_order?: {
    work_order_no: string;
    service_product?: {
      name: string;
      checklist: any[];
    }
  };
  items: any[];
}

export default function FieldTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'list' | 'details'>('list');
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      // Backend has findByEngineer endpoint
      const res = await fetch(`${API_BASE_URL}/inspections/engineer/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync tasks");
    } finally {
      setLoading(false);
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
        if (selectedTask) {
          const updatedItems = selectedTask.items.map(item => 
            item.id === itemId ? { ...item, status, notes } : item
          );
          setSelectedTask({ ...selectedTask, items: updatedItems });
        }
      }
    } catch (e) {
      toast.error("Failed to update item");
    }
  };

  const handleCompleteAudit = async () => {
    if (!token || !selectedTask) return;
    
    setLoading(true);
    try {
      // Get location
      let lat = null;
      let lng = null;
      
      try {
        const pos: any = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        console.warn("Location access denied or timeout");
      }

      const res = await fetch(`${API_BASE_URL}/inspections/${selectedTask.id}`, {
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
        toast.success("Audit submitted successfully! Certificate is being generated.");
        setView('list');
        fetchTasks();
      }
    } catch (e) {
      toast.error("Failed to submit audit");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'details' && selectedTask) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] md:h-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setView('list')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-foreground">Inspection Details</h1>
            <p className="text-sm text-muted-foreground">{selectedTask.client.name}</p>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pb-20">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Order</span>
              <span className="text-sm font-bold text-blue-600">{selectedTask.work_order?.work_order_no || "N/A"}</span>
            </div>
            <h2 className="text-xl font-bold">{selectedTask.work_order?.service_product?.name || "Safety Audit"}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedTask.client.city || "On-site"}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedTask.scheduled_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-2">Checklist Items</h3>
            {selectedTask.items.map((item, idx) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-bold leading-tight">{idx + 1}. {item.description}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant={item.status === 'PASS' ? 'default' : 'outline'} 
                      className={cn("w-10 h-10 rounded-xl", item.status === 'PASS' && "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20")}
                      onClick={() => handleUpdateItem(item.id, 'PASS')}
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={item.status === 'FAIL' ? 'destructive' : 'outline'} 
                      className={cn("w-10 h-10 rounded-xl", item.status === 'FAIL' && "shadow-lg shadow-destructive/20")}
                      onClick={() => handleUpdateItem(item.id, 'FAIL')}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <Input 
                  placeholder="Observations / Notes..." 
                  className="bg-muted/30 border-none rounded-xl h-12"
                  value={item.notes || ""}
                  onChange={(e) => handleUpdateItem(item.id, item.status, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold italic">Capture Site Evidence</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Geo-tagged photos required for certification</p>
            </div>
            <Button variant="outline" className="rounded-xl border-blue-600/20 text-blue-600 font-bold">
              Snap
            </Button>
          </div>
        </div>

        <div className="fixed bottom-6 left-6 right-6 lg:static lg:mt-8">
          <Button 
            onClick={handleCompleteAudit}
            disabled={loading || selectedTask.status === 'COMPLETED'}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
          >
            {loading ? "Submitting..." : selectedTask.status === 'COMPLETED' ? "Submitted" : "Finalize & Sign Off"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Field Tasks
        </h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" /> {tasks.filter(t => t.status !== 'COMPLETED').length} Active Assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-card/50 border border-border rounded-3xl animate-pulse" />
          ))
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ClipboardCheck className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-bold">No tasks assigned to you yet.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => {
                setSelectedTask(task);
                setView('details');
              }}
              className="group bg-card hover:bg-muted/20 border border-border rounded-[2rem] p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1", 
                  task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' :
                  'bg-blue-500/10 text-blue-600 ring-blue-500/20'
                )}>
                  {task.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client</p>
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{task.client.name}</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scope</p>
                  <p className="font-semibold text-foreground/80">{task.work_order?.service_product?.name || "Safety Inspection"}</p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> {task.client.city || "Site"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(task.scheduled_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">Safety Protocol Reminder</h4>
          <p className="text-sm text-amber-800/80">Always ensure all personal protective equipment (PPE) is worn before starting an on-site audit. Your GPS location is verified for each submission.</p>
        </div>
      </div>
    </div>
  );
}
