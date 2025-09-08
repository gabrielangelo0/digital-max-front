import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Film, 
  Building2, 
  Calendar, 
  ShoppingCart,
  Users,
  BarChart3
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { useMoviesStore } from '@/stores/movies';
import { motion } from 'framer-motion';

// Import admin pages
import MoviesManagement from './admin/MoviesManagement';
import CinemasManagement from './admin/CinemasManagement';
import SessionsManagement from './admin/SessionsManagement';
import OrdersManagement from './admin/OrdersManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { movies, cinemas, sessions } = useMoviesStore();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/filmes', label: 'Filmes', icon: Film },
    { path: '/admin/cinemas', label: 'Cinemas', icon: Building2 },
    { path: '/admin/sessoes', label: 'Sessões', icon: Calendar },
    { path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Dashboard Overview Component
  const DashboardOverview = () => {
    const orders = JSON.parse(localStorage.getItem('tickets.orders') || '[]');
    const users = JSON.parse(localStorage.getItem('tickets.users') || '[]');
    
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalTickets = orders.reduce((sum: number, order: any) => sum + order.seats.length, 0);

    const stats = [
      {
        title: 'Filmes Ativos',
        value: movies.filter(m => m.isActive).length,
        description: 'Filmes em cartaz',
        icon: Film,
        color: 'text-blue-500',
      },
      {
        title: 'Cinemas',
        value: cinemas.filter(c => c.isActive).length,
        description: 'Cinemas ativos',
        icon: Building2,
        color: 'text-green-500',
      },
      {
        title: 'Sessões',
        value: sessions.filter(s => s.isActive).length,
        description: 'Sessões ativas',
        icon: Calendar,
        color: 'text-purple-500',
      },
      {
        title: 'Usuários',
        value: users.length,
        description: 'Usuários cadastrados',
        icon: Users,
        color: 'text-orange-500',
      },
      {
        title: 'Ingressos Vendidos',
        value: totalTickets,
        description: 'Total de ingressos',
        icon: ShoppingCart,
        color: 'text-primary',
      },
      {
        title: 'Receita Total',
        value: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(totalRevenue),
        description: 'Receita acumulada',
        icon: BarChart3,
        color: 'text-emerald-500',
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie filmes, cinemas, sessões e acompanhe as vendas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>
              Últimas 5 transações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma venda realizada ainda.</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.movieTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.seats.length} ingresso{order.seats.length > 1 ? 's' : ''} • {order.cinemaName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(order.total)}
                      </p>
                      <Badge variant="default" className="text-xs">
                        {order.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Administração</h2>
              <Badge variant="secondary" className="text-xs">
                Logado como Admin
              </Badge>
            </div>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? "default" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.path}>
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/filmes" element={<MoviesManagement />} />
              <Route path="/cinemas" element={<CinemasManagement />} />
              <Route path="/sessoes" element={<SessionsManagement />} />
              <Route path="/pedidos" element={<OrdersManagement />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;