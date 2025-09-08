import { useState, useEffect } from 'react';
import { Search, Eye, Calendar, Users, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const ordersData = localStorage.getItem('tickets.orders');
      const allOrders: Order[] = ordersData ? JSON.parse(ordersData) : [];
      
      // Ordenar por data mais recente
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.cinemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  // Calculate statistics
  const totalRevenue = orders.filter(o => o.status === 'confirmed').reduce((sum, order) => sum + order.total, 0);
  const totalTickets = orders.filter(o => o.status === 'confirmed').reduce((sum, order) => sum + order.seats.length, 0);
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Histórico de Pedidos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as vendas de ingressos
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Total de ingressos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Faturamento acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {confirmedOrders > 0 ? formatPrice(totalRevenue / confirmedOrders) : formatPrice(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por pedido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground flex items-center">
          {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros' 
                  : 'Ainda não há pedidos realizados'
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.movieTitle}</h3>
                          <p className="text-muted-foreground">{order.cinemaName} • {order.roomName}</p>
                        </div>
                        <Badge variant={order.status === 'confirmed' ? 'default' : 'destructive'}>
                          {order.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data da Sessão</p>
                          <p className="font-medium">
                            {formatDate(order.date)} às {formatTime(order.time)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Assentos</p>
                          <p className="font-medium">
                            {order.seats.map(s => s.seatId).join(', ')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Ingressos</p>
                          <p className="font-medium">
                            {order.seats.length} ingresso{order.seats.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end space-y-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span>Pagamento: {order.paymentMethod}</span>
                      <span>QR Code: {order.qrCode}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalhes do Pedido #{selectedOrder.id.slice(0, 8).toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Movie and Session Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações da Sessão</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Filme:</strong> {selectedOrder.movieTitle}</p>
                    <p><strong>Cinema:</strong> {selectedOrder.cinemaName}</p>
                    <p><strong>Sala:</strong> {selectedOrder.roomName}</p>
                    <p><strong>Data:</strong> {formatDate(selectedOrder.date)}</p>
                    <p><strong>Horário:</strong> {formatTime(selectedOrder.time)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Informações do Pedido</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> 
                      <Badge variant={selectedOrder.status === 'confirmed' ? 'default' : 'destructive'} className="ml-2">
                        {selectedOrder.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </Badge>
                    </p>
                    <p><strong>Data da Compra:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                    <p><strong>Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>QR Code:</strong> {selectedOrder.qrCode}</p>
                  </div>
                </div>
              </div>
              
              {/* Tickets */}
              <div>
                <h4 className="font-semibold mb-2">Ingressos</h4>
                <div className="space-y-2">
                  {selectedOrder.seats.map((seat, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span>Assento {seat.seatId}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{seat.ticketType}</Badge>
                        <span className="font-medium">{formatPrice(seat.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Pago:</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setSelectedOrder(null)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;