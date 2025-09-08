import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMoviesStore } from '@/stores/movies';
import { SessionDetails } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SessionsManagement = () => {
  const { 
    sessions, 
    movies,
    cinemas,
    rooms,
    loadData, 
    addSession, 
    updateSession, 
    deleteSession, 
    toggleSessionStatus,
    getSessionById 
  } = useMoviesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovie, setFilterMovie] = useState('all');
  const [filterCinema, setFilterCinema] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionDetails | null>(null);
  const [deletingSession, setDeletingSession] = useState<SessionDetails | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get session details with related data
  const sessionsWithDetails = sessions.map(session => getSessionById(session.id)).filter(Boolean) as SessionDetails[];

  const filteredSessions = sessionsWithDetails.filter(session => {
    const matchesSearch = session.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.cinema.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMovie = filterMovie === 'all' || session.movieId === filterMovie;
    const matchesCinema = filterCinema === 'all' || session.cinemaId === filterCinema;
    
    return matchesSearch && matchesMovie && matchesCinema;
  });

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMM", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Sessões</h1>
          <p className="text-muted-foreground">
            Gerencie horários e sessões dos filmes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Sessão
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-500/10">
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar sessões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterMovie} onValueChange={setFilterMovie}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos os filmes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os filmes</SelectItem>
            {movies.map(movie => (
              <SelectItem key={movie.id} value={movie.id}>
                {movie.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterCinema} onValueChange={setFilterCinema}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos os cinemas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cinemas</SelectItem>
            {cinemas.map(cinema => (
              <SelectItem key={cinema.id} value={cinema.id}>
                {cinema.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground flex items-center">
          {filteredSessions.length} sessão{filteredSessions.length !== 1 ? 'ões' : ''} encontrada{filteredSessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhuma sessão encontrada</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterMovie !== 'all' || filterCinema !== 'all' 
                  ? 'Tente ajustar os filtros' 
                  : 'Comece adicionando sua primeira sessão'
                }
              </p>
            </div>
            {!searchQuery && filterMovie === 'all' && filterCinema === 'all' && (
              <Button onClick={() => setShowForm(true)} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Sessão
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {session.movie.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {session.cinema.name}
                      </p>
                    </div>
                    <Badge variant={session.isActive ? "default" : "secondary"}>
                      {session.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Data</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{formatDate(session.date)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-1">Horário</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{formatTime(session.time)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-1">Sala</p>
                      <Badge variant="outline">
                        {session.room.name} ({session.room.type})
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-1">Preço</p>
                      <span className="font-bold text-primary">
                        {formatPrice(session.basePrice)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-1">Ocupação</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(session.occupiedSeats.length / session.room.totalSeats) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {session.occupiedSeats.length}/{session.room.totalSeats}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSession(session)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleSessionStatus(session.id);
                        showSuccess(`Sessão ${session.isActive ? 'desativada' : 'ativada'} com sucesso!`);
                      }}
                      className={session.isActive ? "text-orange-600" : "text-green-600"}
                    >
                      {session.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingSession(session)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal placeholder */}
      {(showForm || editingSession) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingSession ? 'Editar Sessão' : 'Adicionar Sessão'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">Formulário em desenvolvimento...</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingSession(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSession} onOpenChange={() => setDeletingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta sessão de "{deletingSession?.movie.title}"? 
              Esta ação não pode ser desfeita e removerá todos os ingressos vendidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingSession) {
                  deleteSession(deletingSession.id);
                  setDeletingSession(null);
                  showSuccess('Sessão removida com sucesso!');
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionsManagement;