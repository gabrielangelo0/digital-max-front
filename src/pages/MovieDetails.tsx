import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Star, Play } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMoviesStore } from '@/stores/movies';
import { Movie } from '@/types';
import { motion } from 'framer-motion';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getMovieById } = useMoviesStore();
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (id) {
      const movieData = getMovieById(id);
      setMovie(movieData || null);
    }
  }, [id, getMovieById]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Filme não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar ao catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const genreImages: Record<string, string> = {
                      'Ação': 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=400&h=600&fit=crop&q=80',
                      'Romance': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop&q=80',
                      'Ficção Científica': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop&q=80',
                      'Comédia': 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=400&h=600&fit=crop&q=80',
                      'Terror': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80',
                      'Animação': 'https://images.unsplash.com/photo-1594736797933-d0ac8cb2837e?w=400&h=600&fit=crop&q=80',
                    };
                    target.src = genreImages[movie.genre] || 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=400&h=600&fit=crop&q=80';
                  }}
                />
              </Card>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary">{movie.genre}</Badge>
                  <Badge variant="outline">
                    {movie.ageRating === 0 ? 'Livre' : `${movie.ageRating}+`}
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                
                <div className="flex items-center gap-6 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{movie.ageRating === 0 ? 'Livre' : `${movie.ageRating} anos`}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Sinopse</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              {/* Trailer */}
              {movie.trailerUrl && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Trailer
                    </h3>
                    <div className="aspect-video">
                      <iframe
                        src={movie.trailerUrl}
                        title={`Trailer de ${movie.title}`}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button size="lg" asChild className="flex-1 gradient-primary">
                  <Link to={`/selecionar/${movie.id}`}>
                    Comprar Ingressos
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/">
                    Voltar ao Catálogo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieDetails;