import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Check, Ticket, Film } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useMoviesStore } from '@/stores/movies';
import { StepperStep, Order } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const paymentSchema = z.object({
  cardNumber: z.string().min(19, 'Número do cartão deve ter 16 dígitos'),
  expiryDate: z.string().min(5, 'Data de validade inválida'),
  cvv: z.string().min(3, 'CVV deve ter 3 dígitos'),
  cardName: z.string().min(2, 'Nome no cartão é obrigatório'),
  installments: z.string(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, currentSession, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { updateOccupiedSeats } = useMoviesStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      installments: '1',
    },
  });

  useEffect(() => {
    if (!user || !currentSession || items.length === 0) {
      navigate('/');
    }
  }, [user, currentSession, items, navigate]);

  if (!currentSession || items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
          <Button onClick={() => navigate('/')}>Voltar ao catálogo</Button>
        </div>
      </div>
    );
  }

  const steps: StepperStep[] = [
    { id: '1', title: 'Filme', description: 'Selecionado', isCompleted: true, isCurrent: false },
    { id: '2', title: 'Sessão', description: 'Escolhida', isCompleted: true, isCurrent: false },
    { id: '3', title: 'Assentos', description: 'Selecionados', isCompleted: true, isCurrent: false },
    { id: '4', title: 'Pagamento', description: 'Finalizar', isCompleted: orderComplete, isCurrent: !orderComplete },
  ];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue('expiryDate', formatted);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const subtotal = getTotal();
  const fees = items.length * 2; // R$ 2 de taxa por ingresso
  const total = subtotal + fees;

  const onSubmit = async (data: PaymentFormData) => {
    if (!user || !currentSession) return;

    setIsProcessing(true);

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Criar ordem
      const newOrder: Order = {
        id: crypto.randomUUID(),
        userId: user.id,
        sessionId: currentSession.id,
        movieTitle: currentSession.movie.title,
        cinemaName: currentSession.cinema.name,
        roomName: currentSession.room.name,
        date: currentSession.date,
        time: currentSession.time,
        seats: items.map(item => ({
          seatId: item.seatId,
          ticketType: item.ticketType,
          price: item.price,
        })),
        total,
        paymentMethod: `Cartão final ${data.cardNumber.slice(-4)}`,
        cardNumber: `****.**** ****${data.cardNumber.slice(-4)}`,
        createdAt: new Date().toISOString(),
        qrCode: `TICKET-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'confirmed',
      };

      // Salvar ordem no localStorage
      const existingOrders = JSON.parse(localStorage.getItem('tickets.orders') || '[]');
      existingOrders.push(newOrder);
      localStorage.setItem('tickets.orders', JSON.stringify(existingOrders));

      // Atualizar assentos ocupados
      const newOccupiedSeats = [...currentSession.occupiedSeats, ...items.map(item => item.seatId)];
      updateOccupiedSeats(currentSession.id, newOccupiedSeats);

      setOrderId(newOrder.id);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <Stepper steps={steps} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-green-500 mb-2"
              >
                Compra Realizada com Sucesso!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground"
              >
                Seus ingressos foram confirmados. Apresente este código na entrada do cinema.
              </motion.p>
            </div>

            {/* Ticket Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative"
            >
              {/* Main Ticket Card */}
              <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-2 border-primary/20 shadow-2xl">
                <div className="relative">
                  {/* Decorative Header */}
                  <div className="h-2 bg-gradient-primary"></div>
                  
                  {/* Ticket Content */}
                  <div className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Left Section - Movie Info */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Cinema Logo */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                              CineMax
                            </h2>
                            <p className="text-sm text-muted-foreground">Ingresso Digital</p>
                          </div>
                        </div>

                        {/* Movie Title */}
                        <div>
                          <h3 className="text-3xl font-bold mb-2">{currentSession.movie.title}</h3>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <Badge variant="secondary">{currentSession.movie.genre}</Badge>
                            <span>{currentSession.movie.duration} min</span>
                            <Badge variant="outline">
                              {currentSession.movie.ageRating === 0 ? 'Livre' : `${currentSession.movie.ageRating}+`}
                            </Badge>
                          </div>
                        </div>

                        {/* Session Details Grid */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Cinema</p>
                              <p className="font-semibold">{currentSession.cinema.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Data</p>
                              <p className="font-semibold">
                                {format(new Date(currentSession.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Assentos</p>
                              <p className="font-semibold text-primary">
                                {items.map(item => item.seatId).join(", ")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Sala</p>
                              <p className="font-semibold">{currentSession.room.name} ({currentSession.room.type})</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Horário</p>
                              <p className="font-semibold text-2xl text-primary">
                                {currentSession.time.slice(0, 5)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Pago</p>
                              <p className="font-bold text-xl text-green-500">
                                {formatPrice(total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - QR Code & Order Info */}
                      <div className="flex flex-col items-center justify-center space-y-6 border-l border-dashed border-border pl-8">
                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                          <div className="w-32 h-32 bg-black flex items-center justify-center rounded-lg">
                            <div className="text-white text-xs font-mono text-center leading-tight p-2">
                              QR CODE<br />
                              {orderId.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Order ID */}
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                            Código do Pedido
                          </p>
                          <p className="font-mono font-bold text-lg">
                            #{orderId.slice(0, 8).toUpperCase()}
                          </p>
                        </div>

                        {/* Validation Info */}
                        <div className="text-center text-xs text-muted-foreground">
                          <p>Válido até:</p>
                          <p className="font-semibold">
                            {format(new Date(currentSession.date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Tickets Details */}
                    <div className="mt-8 pt-6 border-t border-dashed border-border">
                      <h4 className="font-semibold mb-4">Detalhes dos Ingressos:</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item, index) => (
                          <div
                            key={item.seatId}
                            className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">Assento {item.seatId}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.ticketType}
                              </Badge>
                            </div>
                            <span className="font-semibold text-primary">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                      <p>
                        Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • 
                        Apresente este código na entrada do cinema
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-background border-4 border-primary rounded-full"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-background border-4 border-primary rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-background border-4 border-primary rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-background border-4 border-primary rounded-full"></div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
            >
              <Button 
                size="lg"
                onClick={() => {
                  const order = {
                    id: orderId,
                    movieTitle: currentSession.movie.title,
                    cinemaName: currentSession.cinema.name,
                    roomName: currentSession.room.name,
                    date: currentSession.date,
                    time: currentSession.time,
                    seats: items,
                    total,
                    qrCode: `TICKET-${orderId.slice(0, 8).toUpperCase()}`,
                    createdAt: new Date().toISOString()
                  };
                  
                  const ticketContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Ingresso - ${order.movieTitle}</title>
                        <style>
                          body { 
                            font-family: 'Arial', sans-serif; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            padding: 20px;
                            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
                            color: white;
                          }
                          .ticket { 
                            background: linear-gradient(135deg, #1e1e1e, #2e2e2e);
                            border: 2px solid #e11d48;
                            border-radius: 15px;
                            padding: 30px; 
                            margin: 20px 0;
                            position: relative;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                          }
                          .ticket::before {
                            content: '';
                            position: absolute;
                            top: -10px;
                            left: -10px;
                            right: -10px;
                            height: 4px;
                            background: linear-gradient(90deg, #e11d48, #dc2626);
                          }
                          .header { 
                            text-align: center; 
                            margin-bottom: 30px;
                            border-bottom: 2px dashed #444;
                            padding-bottom: 20px;
                          }
                          .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #e11d48;
                            margin-bottom: 5px;
                          }
                          .movie-title {
                            font-size: 24px;
                            font-weight: bold;
                            margin: 20px 0;
                            color: #ffffff;
                          }
                          .info { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 20px; 
                            margin: 30px 0;
                          }
                          .info-item {
                            background: rgba(255,255,255,0.05);
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #e11d48;
                          }
                          .info-label {
                            font-size: 12px;
                            color: #888;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                          }
                          .info-value {
                            font-size: 16px;
                            font-weight: bold;
                            color: white;
                          }
                          .qr-section {
                            text-align: center;
                            margin: 30px 0;
                            padding: 20px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 10px;
                          }
                          .qr-code {
                            display: inline-block;
                            background: white;
                            color: black;
                            padding: 20px;
                            font-family: monospace;
                            font-size: 16px;
                            border-radius: 8px;
                            margin: 10px;
                          }
                          .seats {
                            background: rgba(225, 29, 72, 0.1);
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            margin: 20px 0;
                          }
                          .total {
                            font-size: 20px;
                            font-weight: bold;
                            color: #22c55e;
                            text-align: center;
                            margin: 20px 0;
                          }
                          @media print {
                            body { 
                              background: white;
                              color: black;
                            }
                            .ticket {
                              background: white;
                              color: black;
                            }
                            .no-print { display: none; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="ticket">
                          <div class="header">
                            <div class="logo">🎬 CineMax</div>
                            <div>Ingresso Digital</div>
                            <div class="movie-title">${order.movieTitle}</div>
                          </div>
                          
                          <div class="info">
                            <div class="info-item">
                              <div class="info-label">Cinema</div>
                              <div class="info-value">${order.cinemaName}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Sala</div>
                              <div class="info-value">${order.roomName}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Data</div>
                              <div class="info-value">${format(new Date(order.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
                            </div>
                            <div class="info-item">
                              <div class="info-label">Horário</div>
                              <div class="info-value">${order.time.slice(0, 5)}</div>
                            </div>
                          </div>

                          <div class="seats">
                            <div class="info-label">Assentos</div>
                            <div style="font-size: 18px; font-weight: bold; color: #e11d48; margin-top: 5px;">
                              ${order.seats.map(s => s.seatId).join(', ')}
                            </div>
                          </div>

                          <div class="qr-section">
                            <div class="info-label">Código QR</div>
                            <div class="qr-code">${order.qrCode}</div>
                            <div style="margin-top: 10px; font-size: 14px; color: #888;">
                              Apresente este código na entrada
                            </div>
                          </div>

                          <div class="total">
                            Total Pago: ${formatPrice(order.total)}
                          </div>

                          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px dashed #333; padding-top: 15px;">
                            Pedido #${order.id.slice(0, 8).toUpperCase()} • 
                            Emitido em ${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>

                        <div class="no-print" style="text-align: center; margin: 30px;">
                          <button onclick="window.print()" style="background: #e11d48; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; margin-right: 10px;">
                            🖨️ Imprimir Ingresso
                          </button>
                          <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer;">
                            Fechar
                          </button>
                        </div>
                      </body>
                    </html>
                  `;

                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(ticketContent);
                    printWindow.document.close();
                  }
                }}
                className="gradient-primary"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Baixar/Imprimir Ingresso
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/conta/compras')}
              >
                Ver Meus Ingressos
              </Button>
              
              <Button 
                variant="ghost"
                size="lg"
                onClick={() => navigate('/')}
              >
                Comprar Mais Ingressos
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Finalizar Compra</h1>
            <p className="text-muted-foreground">Complete o pagamento para confirmar seus ingressos</p>
          </div>
        </div>

        <Stepper steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dados do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      {...register('cardNumber')}
                      onChange={handleCardNumberChange}
                    />
                    {errors.cardNumber && (
                      <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Validade</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/AA"
                        maxLength={5}
                        {...register('expiryDate')}
                        onChange={handleExpiryDateChange}
                      />
                      {errors.expiryDate && (
                        <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                      )}
                    </div>

                    {/* CVV */}
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="000"
                        maxLength={3}
                        {...register('cvv')}
                      />
                      {errors.cvv && (
                        <p className="text-sm text-destructive">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="Nome como impresso no cartão"
                      {...register('cardName')}
                    />
                    {errors.cardName && (
                      <p className="text-sm text-destructive">{errors.cardName.message}</p>
                    )}
                  </div>

                  {/* Installments */}
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelamento</Label>
                    <Select value={watch('installments')} onValueChange={(value) => setValue('installments', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x de {formatPrice(total)} sem juros</SelectItem>
                        <SelectItem value="2">2x de {formatPrice(total / 2)} sem juros</SelectItem>
                        <SelectItem value="3">3x de {formatPrice(total / 3)} sem juros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Demo Alert */}
                  <Alert>
                    <AlertDescription>
                      Este é um ambiente de demonstração. Nenhum pagamento real será processado.
                      Use qualquer número de cartão para simular a compra.
                    </AlertDescription>
                  </Alert>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando Pagamento...
                      </div>
                    ) : (
                      `Pagar ${formatPrice(total)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Movie Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold">{currentSession.movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentSession.cinema.name} • Sala {currentSession.room.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(currentSession.date), "dd 'de' MMMM", { locale: ptBR })} às {currentSession.time.slice(0, 5)}
                  </p>
                </div>

                {/* Seats */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Ingressos</h4>
                  {items.map((item) => (
                    <div key={item.seatId} className="flex justify-between text-sm mb-1">
                      <span>Assento {item.seatId} ({item.ticketType})</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de conveniência</span>
                    <span>{formatPrice(fees)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;