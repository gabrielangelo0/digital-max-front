import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
}

const genreColors: Record<string, string> = {
  'Ação': 'bg-red-500',
  'Romance': 'bg-pink-500',
  'Ficção Científica': 'bg-blue-500',
  'Comédia': 'bg-yellow-500',
  'Terror': 'bg-purple-500',
  'Animação': 'bg-green-500',
  'Drama': 'bg-gray-500',
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

const getAgeRatingColor = (rating: number): string => {
  if (rating === 0) return 'bg-green-500';
  if (rating <= 12) return 'bg-yellow-500';
  if (rating <= 16) return 'bg-orange-500';
  return 'bg-red-500';
};

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="movie-card overflow-hidden border-border">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Fallback para uma imagem colorida do Unsplash baseada no gênero
              const genreImages: Record<string, string> = {
                'Ação': 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=300&h=450&fit=crop&q=80',
                'Romance': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop&q=80',
                'Ficção Científica': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=450&fit=crop&q=80',
                'Comédia': 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=300&h=450&fit=crop&q=80',
                'Terror': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop&q=80',
                'Animação': 'https://images.unsplash.com/photo-1594736797933-d0ac8cb2837e?w=300&h=450&fit=crop&q=80',
              };
              target.src = genreImages[movie.genre] || 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=300&h=450&fit=crop&q=80';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Age Rating Badge */}
          <Badge 
            className={`absolute top-3 left-3 ${getAgeRatingColor(movie.ageRating)} text-white font-bold`}
          >
            {movie.ageRating === 0 ? 'L' : `${movie.ageRating}`}
          </Badge>
          
          {/* Genre Badge */}
          <Badge 
            className={`absolute top-3 right-3 ${genreColors[movie.genre] || 'bg-gray-500'} text-white`}
          >
            {movie.genre}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {movie.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {movie.synopsis}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>
                  {movie.ageRating === 0 ? 'Livre' : `${movie.ageRating}+`}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to={`/filme/${movie.id}`}>
                  Ver Detalhes
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1 gradient-primary">
                <Link to={`/selecionar/${movie.id}`}>
                  Comprar
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};