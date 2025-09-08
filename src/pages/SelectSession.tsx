import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMoviesStore } from '@/stores/movies';
import { useCartStore } from '@/stores/cart';
import { Movie, Cinema, SessionDetails, StepperStep } from '@/types';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SelectSession = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { getMovieById, getCitiesForMovie, getCinemasForMovie, getSessionsByCity, getSessionsByCinema } = useMoviesStore();
  const { setCurrentSession } = useCartStore();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [sessions, setSessions] = useState<SessionDetails[]>([]);

  useEffect(() => {
    if (movieId) {
      const movieData = getMovieById(movieId);
      setMovie(movieData || null);
      
      if (movieData) {
        const movieCities = getCitiesForMovie(movieId);
        setCities(movieCities);
      }
    }
  }, [movieId, getMovieById, getCitiesForMovie]);

  useEffect(() => {
    if (movieId && selectedCity) {
      const movieCinemas = getCinemasForMovie(movieId, selectedCity);
      setCinemas(movieCinemas);
      setSelectedCinema(null);
      setSessions([]);
    }
  }, [selectedCity, movieId, getCinemasForMovie]);

  useEffect(() => {
    if (movieId && selectedCinema && selectedDate) {
      const cinemaSessions = getSessionsByCinema(movieId, selectedCinema.id)
        .filter(session => session.date === selectedDate);
      setSessions(cinemaSessions);
    }
  }, [selectedCinema, selectedDate, movieId, getSessionsByCinema]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Filme não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar ao catálogo</Button>
        </div>
      </div>
    );
  }

  const steps: StepperStep[] = [
    { id: '1', title: 'Filme', description: 'Selecionado', isCompleted: true, isCurrent: false },
    { id: '2', title: 'Sessão', description: 'Escolher', isCompleted: false, isCurrent: true },
    { id: '3', title: 'Assentos', description: 'Selecionar', isCompleted: false, isCurrent: false },
    { id: '4', title: 'Pagamento', description: 'Finalizar', isCompleted: false, isCurrent: false },
  ];

  const handleSessionSelect = (session: SessionDetails) => {
    setCurrentSession(session);
    navigate(`/assentos/${session.id}`);
  };

  // Gerar próximos 7 dias
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE dd/MM', { locale: ptBR }),
        fullLabel: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
      });
    }
    return days;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove segundos se existirem
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

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
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <p className="text-muted-foreground">{movie.genre} • {movie.duration} min</p>
          </div>
        </div>

        <Stepper steps={steps} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Step 1: City Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Selecione a Cidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "outline"}
                    className="h-auto py-4"
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Cinema Selection */}
          {selectedCity && (
            <Card>
              <CardHeader>
                <CardTitle>Selecione o Cinema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cinemas.map((cinema) => (
                    <Button
                      key={cinema.id}
                      variant={selectedCinema?.id === cinema.id ? "default" : "outline"}
                      className="w-full h-auto p-4 justify-start"
                      onClick={() => setSelectedCinema(cinema)}
                    >
                      <div className="text-left">
                        <p className="font-semibold">{cinema.name}</p>
                        <p className="text-sm text-muted-foreground">{cinema.address}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Date Selection */}
          {selectedCinema && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Selecione a Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {getNext7Days().map((day) => (
                    <Button
                      key={day.date}
                      variant={selectedDate === day.date ? "default" : "outline"}
                      className="h-auto py-3 flex-col"
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span className="text-xs uppercase">{day.label.split(' ')[0]}</span>
                      <span className="font-semibold">{day.label.split(' ')[1]}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Session Selection */}
          {selectedDate && sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Selecione o Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex-col space-y-2 hover:border-primary"
                        onClick={() => handleSessionSelect(session)}
                      >
                        <span className="text-lg font-bold">
                          {formatTime(session.time)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {session.room.type}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(session.basePrice)}
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDate && sessions.length === 0 && selectedCinema && (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  Nenhuma sessão disponível para esta data.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SelectSession;