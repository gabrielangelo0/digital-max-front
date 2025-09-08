import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { MovieForm } from '@/components/admin/MovieForm';
import { useMoviesStore } from '@/stores/movies';
import { Movie } from '@/types';
import { motion } from 'framer-motion';

const MoviesManagement = () => {
  const { 
    movies, 
    loadData, 
    addMovie, 
    updateMovie, 
    deleteMovie, 
    toggleMovieStatus 
  } = useMoviesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMovie = async (movieData: Omit<Movie, 'id' | 'isActive'>) => {
    setIsLoading(true);
    try {
      addMovie(movieData);
      setShowForm(false);
      setSuccess('Filme adicionado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao adicionar filme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMovie = async (movieData: Omit<Movie, 'id' | 'isActive'>) => {
    if (!editingMovie) return;
    
    setIsLoading(true);
    try {
      updateMovie(editingMovie.id, movieData);
      setEditingMovie(null);
      setSuccess('Filme atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar filme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!deletingMovie) return;
    
    try {
      deleteMovie(deletingMovie.id);
      setDeletingMovie(null);
      setSuccess('Filme removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao remover filme:', error);
    }
  };

  const handleToggleStatus = async (movie: Movie) => {
    try {
      toggleMovieStatus(movie.id);
      setSuccess(`Filme ${movie.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao alterar status do filme:', error);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  if (showForm || editingMovie) {
    return (
      <div className="p-6">
        <MovieForm
          movie={editingMovie || undefined}
          onSubmit={editingMovie ? handleUpdateMovie : handleAddMovie}
          onCancel={() => {
            setShowForm(false);
            setEditingMovie(null);
          }}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Filmes</h1>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie o catálogo de filmes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Filme
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar filmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredMovies.length} filme{filteredMovies.length !== 1 ? 's' : ''} encontrado{filteredMovies.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhum filme encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro filme'}
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Filme
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=400&h=225&fit=crop&q=80';
                      }}
                    />
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    variant={movie.isActive ? "default" : "secondary"}
                    className="absolute top-3 right-3"
                  >
                    {movie.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  {/* Age Rating */}
                  <Badge 
                    variant="outline" 
                    className="absolute top-3 left-3 bg-black/50 text-white border-white/20"
                  >
                    {movie.ageRating === 0 ? 'L' : `${movie.ageRating}+`}
                  </Badge>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {movie.synopsis}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="secondary">{movie.genre}</Badge>
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMovie(movie)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(movie)}
                      className={movie.isActive ? "text-orange-600" : "text-green-600"}
                    >
                      {movie.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingMovie(movie)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMovie} onOpenChange={() => setDeletingMovie(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o filme "{deletingMovie?.title}"? 
              Esta ação não pode ser desfeita e removerá todas as sessões associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMovie}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Filme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MoviesManagement;