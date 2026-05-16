"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.access_token) {
        useAuthStore.getState().setAuth(data.access_token, data.user);
        toast.success("Authentication successful. Redirecting...");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || 'Login failed');
        setLoading(false);
      }
    } catch {
      toast.error('Network error communicating with the backend');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card/50 backdrop-blur-xl border-r border-border relative z-10">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Global Safety Logo" width={48} height={48} className="rounded-xl shadow-lg shadow-primary/20" />
          <span className="text-2xl font-bold tracking-tight text-foreground">Global Safety Solution</span>
        </div>
        
        <div className="space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 pb-2">
            Enterprise Grade <br /> Compliance Mastery.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Manage your field operations, track real-time compliance lifecycles, and handle all your safety inspections within one centralized platform.
          </p>
        </div>
        
        <div className="text-sm font-medium text-muted-foreground">
          © {new Date().getFullYear()} Global Safety ERP System. All rights reserved.
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <Image src="/logo.png" alt="Global Safety Logo" width={40} height={40} className="rounded-xl shadow-lg" />
            <span className="text-2xl font-bold text-foreground">Global Safety</span>
          </div>

          <Card className="border border-border shadow-2xl bg-card/80 backdrop-blur-md">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Enter your credentials to access the ERP dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-medium">Email address</Label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all py-6"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground/80 font-medium">Password</Label>
                    <a href="#" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all py-6"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base py-6 shadow-lg transition-all group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto opacity-50" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
