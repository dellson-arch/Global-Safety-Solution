"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { 
  Receipt, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Building2,
  User,
  Paperclip,
  TrendingUp,
  CreditCard,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "General",
    date: new Date().toISOString().split('T')[0],
    vendor_id: "",
    attachment_url: ""
  });

  useEffect(() => {
    fetchExpenses();
    fetchVendors();
  }, [token]);

  const fetchVendors = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setVendors(data);
    } catch (e) { console.error(e); }
  };

  const fetchExpenses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setExpenses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          date: new Date(formData.date).toISOString()
        })
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ description: "", amount: "", category: "General", date: new Date().toISOString().split('T')[0], vendor_id: "", attachment_url: "" });
        toast.success("Expense submitted for approval!");
        fetchExpenses();
      }
    } catch (e) {
      toast.error("Failed to submit expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Expense ${status.toLowerCase()} successfully`);
        fetchExpenses();
      }
    } catch (e) {
      toast.error("Status update failed.");
    }
  };

  const isManager = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-pink-500 to-amber-600">
            Expense Control
          </h1>
          <p className="text-muted-foreground font-medium text-sm lg:text-base">Submit claims, track reimbursements, and manage corporate spend.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xl shadow-rose-500/20 px-8 h-12 border-0 transition-all active:scale-95" />}>
            <Plus className="w-5 h-5 mr-2" /> Log New Expense
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Expense Reimbursement</DialogTitle>
              <DialogDescription className="text-muted-foreground">Log your business expenditures for approval.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitExpense} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Description / Item Name *</Label>
                <Input 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Travel to client site, Office supplies, etc."
                  className="bg-background border-border h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
                  <Input 
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="bg-background border-border h-11 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-background border-border h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-rose-500 text-foreground"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>General</option>
                      <option>Travel</option>
                      <option>Meals</option>
                      <option>Infrastructure</option>
                      <option>Operations</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label>Associated Vendor</Label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm focus:ring-2 focus:ring-rose-500 text-foreground"
                      value={formData.vendor_id}
                      onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                    >
                      <option value="">No specific vendor</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-500 text-white font-bold w-full h-12 shadow-xl shadow-rose-500/20 rounded-xl mt-4 border-0">
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Approvals", value: expenses.filter(e => e.status === 'PENDING').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Approved This Month", value: `₹${expenses.filter(e => e.status === 'APPROVED').reduce((acc, e) => acc + Number(e.amount), 0).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Reimbursement History", value: expenses.length, icon: History, color: "text-blue-600", bg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 border border-border rounded-[2rem] p-6 flex items-center justify-between backdrop-blur-md shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-border/50`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card/40 border border-border rounded-[2.5rem] overflow-hidden shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Expense Details</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Submitted By</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                {isManager && <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Approvals</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={isManager ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground italic">Fetching expense history...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground italic">No expense records found.</td>
                </tr>
              ) : expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-foreground font-bold text-sm">{expense.description}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{expense.category}</span>
                        {expense.vendor && (
                          <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" /> {expense.vendor.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground/90">{expense.user?.name}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-black text-foreground tabular-nums">₹{Number(expense.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ring-1", 
                      expense.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' :
                      expense.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 ring-rose-500/20' :
                      'bg-amber-500/10 text-amber-500 ring-amber-500/20'
                    )}>
                      {expense.status}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-6 py-6 text-right">
                      {expense.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleUpdateStatus(expense.id, 'APPROVED')}
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-500 h-8 rounded-lg text-[10px] font-black uppercase"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(expense.id, 'REJECTED')}
                            size="sm" 
                            variant="ghost" 
                            className="text-rose-500 hover:bg-rose-500/10 h-8 rounded-lg text-[10px] font-black uppercase"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase">Processed by</span>
                           <span className="text-[10px] font-black text-foreground">{expense.approver?.name || "System"}</span>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
