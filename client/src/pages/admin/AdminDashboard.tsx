import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  LogOut,
  Sun,
  Moon,
  Globe
} from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import AdminUsers from "./AdminUsers";
import AdminServices from "./AdminServices";
import AdminOrders from "./AdminOrders";

export default function AdminDashboard() {
  const { t, direction, language, setLanguage } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  const { data: usersData } = useQuery<{ users: any[]; total: number }>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: ordersData } = useQuery<{ orders: any[]; total: number }>({
    queryKey: ["/api/admin/orders"],
    enabled: isAdmin,
  });

  const { data: servicesData } = useQuery<{ services: any[]; total: number }>({
    queryKey: ["/api/admin/services"],
    enabled: isAdmin,
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
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

  const totalUsers = usersData?.users?.length || 0;
  const totalOrders = ordersData?.orders?.length || 0;
  const totalServices = servicesData?.services?.length || 0;
  const totalBalance = usersData?.users?.reduce((acc: number, u: any) => acc + (u.balance || 0), 0) || 0;

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
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              data-testid="button-language-toggle"
            >
              <Globe className="w-5 h-5" />
            </Button>
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
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">{t("totalUsers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{t("totalBalance")}</p>
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
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">{t("totalOrders")}</p>
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
                  <p className="text-2xl font-bold">{totalServices}</p>
                  <p className="text-xs text-muted-foreground">{t("services")}</p>
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
