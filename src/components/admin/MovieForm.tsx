import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Movie } from '@/types';

const movieSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  synopsis: z.string().min(10, 'Sinopse deve ter pelo menos 10 caracteres').max(500, 'Sinopse muito longa'),
  posterUrl: z.string().url('URL da imagem inválida'),
  trailerUrl: z.string().url('URL do trailer inválida').optional().or(z.literal('')),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  duration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto').max(600, 'Duração muito longa'),
  ageRating: z.number().min(0, 'Classificação inválida').max(18, 'Classificação inválida'),
  releaseDate: z.string().min(1, 'Data de lançamento é obrigatória'),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: Omit<Movie, 'id' | 'isActive'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const genres = [
  'Ação',
  'Aventura', 
  'Animação',
  'Comédia',
  'Crime',
  'Drama',
  'Fantasia',
  'Ficção Científica',
  'Romance',
  'Terror',
  'Thriller',
  'Documentário'
];

const ageRatings = [
  { value: 0, label: 'Livre' },
  { value: 10, label: '10+' },
  { value: 12, label: '12+' },
  { value: 14, label: '14+' },
  { value: 16, label: '16+' },
  { value: 18, label: '18+' },
];

export const MovieForm = ({ movie, onSubmit, onCancel, isLoading = false }: MovieFormProps) => {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: movie ? {
      title: movie.title,
      synopsis: movie.synopsis,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl || '',
      genre: movie.genre,
      duration: movie.duration,
      ageRating: movie.ageRating,
      releaseDate: movie.releaseDate,
    } : {
      ageRating: 0,
      duration: 90,
      releaseDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = async (data: MovieFormData) => {
    setError('');
    try {
      onSubmit({
        title: data.title,
        synopsis: data.synopsis,
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl || undefined,
        genre: data.genre,
        duration: data.duration,
        ageRating: data.ageRating,
        releaseDate: data.releaseDate,
      });
    } catch (err) {
      setError('Erro ao salvar filme. Tente novamente.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{movie ? 'Editar Filme' : 'Adicionar Novo Filme'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Nome do filme"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <Label htmlFor="synopsis">Sinopse *</Label>
            <Textarea
              id="synopsis"
              placeholder="Descrição do filme..."
              rows={4}
              {...register('synopsis')}
            />
            {errors.synopsis && (
              <p className="text-sm text-destructive">{errors.synopsis.message}</p>
            )}
          </div>

          {/* Poster URL */}
          <div className="space-y-2">
            <Label htmlFor="posterUrl">URL da Imagem do Poster *</Label>
            <Input
              id="posterUrl"
              placeholder="https://exemplo.com/poster.jpg"
              {...register('posterUrl')}
            />
            {errors.posterUrl && (
              <p className="text-sm text-destructive">{errors.posterUrl.message}</p>
            )}
            {watch('posterUrl') && (
              <div className="mt-2">
                <img
                  src={watch('posterUrl')}
                  alt="Preview"
                  className="w-32 h-48 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Trailer URL */}
          <div className="space-y-2">
            <Label htmlFor="trailerUrl">URL do Trailer (Opcional)</Label>
            <Input
              id="trailerUrl"
              placeholder="https://youtube.com/embed/..."
              {...register('trailerUrl')}
            />
            {errors.trailerUrl && (
              <p className="text-sm text-destructive">{errors.trailerUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Gênero *</Label>
              <Select
                value={watch('genre') || ''}
                onValueChange={(value) => setValue('genre', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genre && (
                <p className="text-sm text-destructive">{errors.genre.message}</p>
              )}
            </div>

            {/* Age Rating */}
            <div className="space-y-2">
              <Label htmlFor="ageRating">Classificação Indicativa *</Label>
              <Select
                value={watch('ageRating')?.toString() || '0'}
                onValueChange={(value) => setValue('ageRating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
                <SelectContent>
                  {ageRatings.map(rating => (
                    <SelectItem key={rating.value} value={rating.value.toString()}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ageRating && (
                <p className="text-sm text-destructive">{errors.ageRating.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="600"
                placeholder="120"
                {...register('duration', { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            {/* Release Date */}
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Data de Lançamento *</Label>
              <Input
                id="releaseDate"
                type="date"
                {...register('releaseDate')}
              />
              {errors.releaseDate && (
                <p className="text-sm text-destructive">{errors.releaseDate.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : movie ? 'Atualizar Filme' : 'Adicionar Filme'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};