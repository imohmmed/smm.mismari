import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  LogOut,
  Sun,
  Moon,
  TrendingUp,
  Percent,
  Loader2,
  Check,
  Wallet,
  CreditCard
} from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminUsers from "./AdminUsers";
import AdminServices from "./AdminServices";
import AdminOrders from "./AdminOrders";

interface AdminStats {
  users: number;
  orders: number;
  services: number;
  totalBalance: number;
  totalSpending: number;
  profit: number;
  profitMargin: number;
}

export default function AdminDashboard() {
  const { t, direction } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  const [editingMargin, setEditingMargin] = useState(false);
  const [newMargin, setNewMargin] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const updateMarginMutation = useMutation({
    mutationFn: async (margin: number) => {
      const res = await apiRequest("POST", "/api/admin/settings/profit-margin", { profitMargin: margin });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingMargin(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث نسبة الأرباح بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث نسبة الأرباح",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleSaveMargin = () => {
    const margin = parseFloat(newMargin);
    if (isNaN(margin) || margin < 0 || margin > 100) {
      toast({
        title: "خطأ",
        description: "النسبة يجب أن تكون بين 0 و 100",
        variant: "destructive",
      });
      return;
    }
    updateMarginMutation.mutate(margin);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Access Denied - Admin Only</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">{t("adminPanel")}</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats?.totalBalance?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">{t("totalBalance")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.users || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("totalUsers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.services?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("services")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.orders || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("totalOrders")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats?.totalSpending?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">${stats?.profit?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">الأرباح</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="flex-1">
                  {editingMargin ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newMargin}
                        onChange={(e) => setNewMargin(e.target.value)}
                        className="w-20 h-8 text-sm"
                        min="0"
                        max="100"
                        data-testid="input-profit-margin"
                      />
                      <span>%</span>
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleSaveMargin}
                        disabled={updateMarginMutation.isPending}
                      >
                        {updateMarginMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNewMargin(stats?.profitMargin?.toString() || "15");
                        setEditingMargin(true);
                      }}
                      className="text-right w-full hover:opacity-80"
                      data-testid="button-edit-margin"
                    >
                      <p className="text-2xl font-bold">{stats?.profitMargin || 15}%</p>
                      <p className="text-xs text-muted-foreground">نسبة الأرباح (اضغط للتعديل)</p>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="w-4 h-4" />
              {t("users")}
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2" data-testid="tab-services">
              <Package className="w-4 h-4" />
              {t("services")}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
              <ShoppingCart className="w-4 h-4" />
              {t("allOrders")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="services">
            <AdminServices />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
