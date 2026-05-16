"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical, 
  ExternalLink,
  Trash2,
  Filter,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const token = useAuthStore((state) => state.token);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gst_number: "",
    pan_number: "",
    address: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    fetchVendors();
  }, [token]);

  const fetchVendors = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setVendors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ name: "", email: "", phone: "", gst_number: "", pan_number: "", address: "", city: "", state: "" });
        toast.success("Vendor registered successfully!");
        fetchVendors();
      }
    } catch (e) {
      toast.error("Failed to register vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
            Vendor Ecosystem
          </h1>
          <p className="text-muted-foreground font-medium text-sm lg:text-base">Manage supplier relationships, compliance, and service providers.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 px-8 h-12 border-0 transition-all active:scale-95" />}>
            <Plus className="w-5 h-5 mr-2" /> Onboard Vendor
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Vendor Registration</DialogTitle>
              <DialogDescription className="text-muted-foreground">Enter vendor details for procurement and financial tracking.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateVendor} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Company / Vendor Name *</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Reliable Safety Gear Co."
                  className="bg-background border-border h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="sales@vendor.com"
                    className="bg-background border-border h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="bg-background border-border h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input 
                    value={formData.gst_number}
                    onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                    placeholder="27AAAAA0000A1Z5"
                    className="bg-background border-border h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input 
                    value={formData.pan_number}
                    onChange={(e) => setFormData({...formData, pan_number: e.target.value})}
                    placeholder="ABCDE1234F"
                    className="bg-background border-border h-11 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold w-full h-12 shadow-xl shadow-indigo-500/20 rounded-xl mt-4 border-0">
                  {submitting ? "Registering..." : "Complete Onboarding"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/40 border border-border rounded-[2.5rem] overflow-hidden shadow-sm backdrop-blur-md">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input className="bg-background border-border pl-9 h-10 w-64 rounded-xl text-sm" placeholder="Search vendors..." />
             </div>
             <Button variant="outline" className="rounded-xl h-10 border-border bg-background">
                <Filter className="w-4 h-4 mr-2" /> Filters
             </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Vendor Details</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Compliance</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Projects/Expenses</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">Synchronizing vendor ledger...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No vendors found.</td>
                </tr>
              ) : vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-accent/5 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-foreground font-bold text-base">{vendor.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-muted-foreground text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.email || "--"}</span>
                           <span className="text-muted-foreground text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> {vendor.phone || "--"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                     <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-muted-foreground">GST: {vendor.gst_number || "NOT PROVIDED"}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground">PAN: {vendor.pan_number || "NOT PROVIDED"}</div>
                     </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                     <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold ring-1 ring-blue-500/20">
                        {vendor._count?.expenses || 0} Records
                     </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/10 rounded-xl" />} />
                      <DropdownMenuContent className="bg-card border-border text-foreground min-w-[160px] rounded-xl shadow-2xl p-2">
                        <DropdownMenuItem className="flex items-center gap-3 py-2.5 rounded-lg font-bold text-sm">
                          <ExternalLink className="w-4 h-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 py-2.5 rounded-lg font-bold text-sm text-rose-500 hover:bg-rose-500/10">
                          <Trash2 className="w-4 h-4" /> Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
