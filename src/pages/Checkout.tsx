import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useMoviesStore } from '@/stores/movies';
import type { Order } from '@/types';

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

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(.{4})/g, '$1 ');
    setValue('cardNumber', value.trim());
  };

  // Format expiry date with slash
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setValue('expiryDate', value);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const subtotal = getTotal();
  const fees = items.length * 2; // R$ 2 de taxa por ingresso
  const total = subtotal + fees;

  const onSubmit = async (data: PaymentFormData) => {
    console.log('🚀 INICIANDO PAGAMENTO...', data);
    if (!user || !currentSession) return;

    setIsProcessing(true);

    try {
      console.log('💳 SIMULANDO PAGAMENTO...');
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduzido para 2s

      console.log('✅ PAGAMENTO PROCESSADO, CRIANDO ORDEM...');

      // Criar ordem
      const orderId = crypto.randomUUID();
      const qrCode = `TICKET-${orderId.slice(0, 8).toUpperCase()}`;
      
      const newOrder: Order = {
        id: orderId,
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
        qrCode,
        status: 'confirmed',
      };

      // Salvar ordem no localStorage
      const existingOrders = JSON.parse(localStorage.getItem('tickets.orders') || '[]');
      existingOrders.push(newOrder);
      localStorage.setItem('tickets.orders', JSON.stringify(existingOrders));

      // Atualizar assentos ocupados
      const newOccupiedSeats = [...currentSession.occupiedSeats, ...items.map(item => item.seatId)];
      updateOccupiedSeats(currentSession.id, newOccupiedSeats);

      // Redirecionar IMEDIATAMENTE para página de confirmação - SEM AGUARDAR
      const ticketData = {
        id: orderId,
        movieTitle: newOrder.movieTitle,
        moviePoster: currentSession.movie.posterUrl || '',
        cinemaName: newOrder.cinemaName,
        roomName: newOrder.roomName,
        sessionTime: newOrder.time,
        sessionDate: newOrder.date,
        seats: items.map(item => item.seatId),
        totalAmount: newOrder.total,
        paymentMethod: 'Cartão de Crédito',
        customerName: user.name,
        qrCode: newOrder.qrCode
      };

      console.log('🎫 DADOS DO TICKET PREPARADOS:', ticketData);
      console.log('🚀 NAVEGANDO PARA CONFIRMAÇÃO...');
      // NAVEGAÇÃO IMEDIATA
      navigate('/confirmacao', { state: { ticketData }, replace: true });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !currentSession || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
            <p className="text-muted-foreground">
              Complete o pagamento para garantir seus ingressos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Movie Info */}
                {currentSession && (
                  <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <img
                      src={currentSession.movie.posterUrl}
                      alt={currentSession.movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{currentSession.movie.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentSession.cinema.name}</p>
                      <p className="text-sm text-muted-foreground">{currentSession.room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentSession.date} - {currentSession.time}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tickets */}
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Ingressos Selecionados</h4>
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.ticketType} - Assento {item.seatId}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de conveniência</span>
                    <span className="text-foreground">{formatPrice(fees)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dados do Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <AlertCircle className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
};

export default Checkout;