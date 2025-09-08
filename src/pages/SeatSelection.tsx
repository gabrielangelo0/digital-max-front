import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Users, Minus, Plus } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useMoviesStore } from '@/stores/movies';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { SessionDetails, StepperStep, Seat } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SeatSelection = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById } = useMoviesStore();
  const { items, addItem, removeItem, updateTicketType, getTotal, currentSession, setCurrentSession } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [halfPriceAgreement, setHalfPriceAgreement] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (sessionId) {
      const sessionData = getSessionById(sessionId);
      if (sessionData) {
        setSession(sessionData);
        setCurrentSession(sessionData);
        generateSeats(sessionData);
      }
    }
  }, [sessionId, getSessionById, setCurrentSession]);

  const generateSeats = (sessionData: SessionDetails) => {
    const seatList: Seat[] = [];
    const { room } = sessionData;
    
    for (let row = 0; row < room.rows; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C...
      
      for (let col = 1; col <= room.columns; col++) {
        const seatId = `${rowLetter}${col}`;
        const isOccupied = sessionData.occupiedSeats.includes(seatId);
        const isAccessible = room.accessibleSeats.includes(seatId);
        
        seatList.push({
          id: seatId,
          row: rowLetter,
          number: col,
          type: isAccessible ? 'accessible' : 'regular',
          status: isOccupied ? 'occupied' : 'available'
        });
      }
    }
    
    setSeats(seatList);
  };

  const handleSeatClick = (seatId: string) => {
    if (!session) return;
    
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    if (selectedSeats.includes(seatId)) {
      // Remover assento
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      removeItem(seatId);
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'available' } : s
      ));
    } else {
      // Adicionar assento
      setSelectedSeats(prev => [...prev, seatId]);
      addItem({
        sessionId: session.id,
        seatId,
        ticketType: 'inteira',
        price: session.basePrice
      });
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'selected' } : s
      ));
    }
  };

  const handleTicketTypeChange = (seatId: string, ticketType: 'inteira' | 'meia') => {
    updateTicketType(seatId, ticketType);
    
    if (ticketType === 'meia') {
      setHalfPriceAgreement(prev => ({ ...prev, [seatId]: false }));
    }
  };

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Verificar se todos os meias-entradas foram confirmados
    const halfPriceSeats = items.filter(item => item.ticketType === 'meia');
    const allHalfPriceConfirmed = halfPriceSeats.every(item => 
      halfPriceAgreement[item.seatId] === true
    );
    
    if (halfPriceSeats.length > 0 && !allHalfPriceConfirmed) {
      alert('Por favor, confirme sua elegibilidade à meia-entrada para todos os ingressos marcados.');
      return;
    }
    
    navigate('/checkout');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sessão não encontrada</h1>
          <Button onClick={() => navigate('/')}>Voltar ao catálogo</Button>
        </div>
      </div>
    );
  }

  const steps: StepperStep[] = [
    { id: '1', title: 'Filme', description: 'Selecionado', isCompleted: true, isCurrent: false },
    { id: '2', title: 'Sessão', description: 'Escolhida', isCompleted: true, isCurrent: false },
    { id: '3', title: 'Assentos', description: 'Selecionar', isCompleted: false, isCurrent: true },
    { id: '4', title: 'Pagamento', description: 'Finalizar', isCompleted: false, isCurrent: false },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getSeatClassName = (seat: Seat) => {
    switch (seat.status) {
      case 'selected':
        return 'seat-selected';
      case 'occupied':
        return 'seat-occupied';
      case 'available':
        return seat.type === 'accessible' ? 'seat-accessible' : 'seat-available';
      default:
        return 'seat-available';
    }
  };

  const rows = Array.from(new Set(seats.map(seat => seat.row))).sort();

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
            <h1 className="text-3xl font-bold">{session.movie.title}</h1>
            <p className="text-muted-foreground">
              {session.cinema.name} • Sala {session.room.name} • {' '}
              {format(new Date(session.date), "dd 'de' MMMM", { locale: ptBR })} às {formatTime(session.time)}
            </p>
          </div>
        </div>

        <Stepper steps={steps} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Selecione seus Assentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Screen */}
                <div className="text-center">
                  <div className="cinema-screen inline-flex items-center justify-center px-16 py-2 rounded-lg mb-4">
                    <Monitor className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-white">TELA</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="space-y-3 max-w-3xl mx-auto">
                  {rows.map(rowLetter => {
                    const rowSeats = seats.filter(seat => seat.row === rowLetter);
                    return (
                      <motion.div
                        key={rowLetter}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center gap-2"
                      >
                        {/* Row Label */}
                        <div className="w-8 text-center font-semibold text-muted-foreground">
                          {rowLetter}
                        </div>
                        
                        {/* Seats */}
                        <div className="flex gap-1">
                          {rowSeats.map((seat, index) => (
                            <motion.button
                              key={seat.id}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={getSeatClassName(seat)}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={seat.status === 'occupied'}
                              title={`Assento ${seat.id} - ${seat.type === 'accessible' ? 'Acessível' : 'Regular'}`}
                            >
                              {seat.number}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="seat-available w-6 h-6"></div>
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat-selected w-6 h-6"></div>
                    <span>Selecionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat-occupied w-6 h-6"></div>
                    <span>Ocupado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat-accessible w-6 h-6"></div>
                    <span>Acessível</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Seats */}
            {selectedSeats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assentos Selecionados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.seatId} className="space-y-3 p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Assento {item.seatId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSeatClick(item.seatId)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Select
                          value={item.ticketType}
                          onValueChange={(value: 'inteira' | 'meia') => 
                            handleTicketTypeChange(item.seatId, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inteira">
                              Inteira - {formatPrice(session.basePrice)}
                            </SelectItem>
                            <SelectItem value="meia">
                              Meia - {formatPrice(session.basePrice * 0.5)}
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {item.ticketType === 'meia' && (
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id={`half-price-${item.seatId}`}
                              checked={halfPriceAgreement[item.seatId] || false}
                              onCheckedChange={(checked) =>
                                setHalfPriceAgreement(prev => ({
                                  ...prev,
                                  [item.seatId]: checked as boolean
                                }))
                              }
                            />
                            <label
                              htmlFor={`half-price-${item.seatId}`}
                              className="text-xs text-muted-foreground leading-tight"
                            >
                              Declaro ser elegível à meia-entrada conforme Lei Federal
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right font-semibold text-primary">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ingressos ({items.length})</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de conveniência</span>
                    <span>{formatPrice(items.length * 2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(getTotal() + (items.length * 2))}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={selectedSeats.length === 0}
                  onClick={handleContinue}
                >
                  {!isAuthenticated ? 'Fazer Login para Continuar' : 'Continuar para Pagamento'}
                </Button>

                {selectedSeats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Selecione pelo menos um assento para continuar
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;