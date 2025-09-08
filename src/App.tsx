import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeSeedData } from "@/lib/seed";
import { useAuthStore } from "@/stores/auth";
import { useMoviesStore } from "@/stores/movies";

// Pages
import Index from "./pages/Index";
import MovieDetails from "./pages/MovieDetails";
import SelectSession from "./pages/SelectSession";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyTickets from "./pages/MyTickets";
import AdminDashboard from "./pages/AdminDashboard";
import TicketConfirmation from "./pages/TicketConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useAuthStore();
  const { loadData } = useMoviesStore();

  useEffect(() => {
    // Inicializar dados seed
    initializeSeedData();
    
    // Carregar dados do localStorage
    loadData();
    
    // Verificar autenticação
    checkAuth();
  }, [checkAuth, loadData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/filme/:id" element={<MovieDetails />} />
              <Route path="/selecionar/:movieId" element={<SelectSession />} />
              <Route path="/assentos/:sessionId" element={<SeatSelection />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmacao" element={<TicketConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/conta/compras" element={<MyTickets />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
