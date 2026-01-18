"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Activity, Lock, User } from "lucide-react";
// import { toast } from "sonner"; 
// Actually I didn't install sonner. I'll use simple alert or just error state.

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(username);

      if (success) {
        const user = useStore.getState().currentUser;
        if (user?.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/clinic');
        }
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi đăng nhập.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-950 dark:to-blue-950 p-4">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <Card className="w-full max-w-md shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative z-10">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="mx-auto bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50">
            Thientam Dental
          </CardTitle>
          <CardDescription>
            Hệ thống quản lý bảo trì thiết bị nha khoa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="admin"
                  className="pl-9 bg-white/50 dark:bg-slate-950/50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  className="pl-9 bg-white/50 dark:bg-slate-950/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
            </Button>

            <div className="text-xs text-center text-muted-foreground mt-4">
              <p>Hỗ trợ kỹ thuật: 0909.xxx.xxx</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
