import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Check, Ticket } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-green-500 mb-2">Compra Realizada!</h1>
              <p className="text-muted-foreground">
                Seus ingressos foram confirmados e enviados por email.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 text-left">
                <div className="space-y-2">
                  <p><strong>Código do Pedido:</strong> #{orderId.slice(0, 8).toUpperCase()}</p>
                  <p><strong>Filme:</strong> {currentSession.movie.title}</p>
                  <p><strong>Cinema:</strong> {currentSession.cinema.name}</p>
                  <p><strong>Data:</strong> {format(new Date(currentSession.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                  <p><strong>Horário:</strong> {currentSession.time.slice(0, 5)}</p>
                  <p><strong>Assentos:</strong> {items.map(item => item.seatId).join(', ')}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                className="w-full gradient-primary" 
                onClick={() => navigate('/conta/compras')}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Ver Meus Ingressos
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Voltar ao Catálogo
              </Button>
            </div>
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