import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Download, Calendar, Clock, MapPin, QrCode } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth';
import { Order } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, navigate]);

  const loadOrders = () => {
    try {
      const ordersData = localStorage.getItem('tickets.orders');
      const allOrders: Order[] = ordersData ? JSON.parse(ordersData) : [];
      
      // Filtrar apenas as ordens do usuário atual
      const userOrders = allOrders.filter(order => order.userId === user?.id);
      
      // Ordenar por data mais recente
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const handleDownloadTicket = (order: Order) => {
    // Criar conteúdo do ingresso para impressão
    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ingresso - ${order.movieTitle}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
              color: black;
            }
            .ticket { 
              border: 2px dashed #ccc; 
              padding: 20px; 
              margin: 20px 0;
              background: #f9f9f9;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            .info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin: 20px 0;
            }
            .qr-code {
              text-align: center;
              margin: 20px 0;
              font-size: 24px;
              font-family: monospace;
              background: #000;
              color: white;
              padding: 10px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>🎬 CineMax</h1>
              <h2>${order.movieTitle}</h2>
            </div>
            
            <div class="info">
              <div><strong>Cinema:</strong> ${order.cinemaName}</div>
              <div><strong>Sala:</strong> ${order.roomName}</div>
              <div><strong>Data:</strong> ${formatDate(order.date)}</div>
              <div><strong>Horário:</strong> ${formatTime(order.time)}</div>
              <div><strong>Assentos:</strong> ${order.seats.map(s => s.seatId).join(', ')}</div>
              <div><strong>Total:</strong> ${formatPrice(order.total)}</div>
            </div>

            <div class="qr-code">
              ${order.qrCode}
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 12px;">
              Código do Pedido: #${order.id.slice(0, 8).toUpperCase()}<br>
              Emitido em: ${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin: 20px;">
            <button onclick="window.print()">Imprimir Ingresso</button>
            <button onclick="window.close()" style="margin-left: 10px;">Fechar</button>
          </div>
        </body>
      </html>
    `;

    // Abrir nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(ticketContent);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando seus ingressos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Ingressos</h1>
          <p className="text-muted-foreground">
            Histórico das suas compras e ingressos
          </p>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert>
              <Ticket className="w-4 h-4" />
              <AlertDescription>
                Você ainda não comprou nenhum ingresso. 
                <Button variant="link" className="p-0 ml-1" onClick={() => navigate('/')}>
                  Explore nosso catálogo
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{order.movieTitle}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                          <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                            {order.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Session Info */}
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{order.cinemaName}</p>
                          <p className="text-sm text-muted-foreground">Sala {order.roomName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{formatDate(order.date)}</p>
                          <p className="text-sm text-muted-foreground">Data da sessão</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{formatTime(order.time)}</p>
                          <p className="text-sm text-muted-foreground">Horário</p>
                        </div>
                      </div>
                    </div>

                    {/* Seats */}
                    <div>
                      <h4 className="font-medium mb-2">Ingressos</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.seats.map((seat, seatIndex) => (
                          <div
                            key={seatIndex}
                            className="flex justify-between items-center p-2 bg-muted/20 rounded"
                          >
                            <span className="font-medium">Assento {seat.seatId}</span>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {seat.ticketType}
                              </Badge>
                              <p className="text-sm font-medium">{formatPrice(seat.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium">Código QR</p>
                          <p className="text-sm text-muted-foreground font-mono">{order.qrCode}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTicket(order)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Ingresso
                      </Button>
                    </div>

                    {/* Payment Info */}
                    <div className="text-sm text-muted-foreground">
                      Pagamento: {order.paymentMethod}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            Comprar Mais Ingressos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;