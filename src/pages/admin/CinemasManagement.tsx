import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Building2 } from 'lucide-react';
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
import { useMoviesStore } from '@/stores/movies';
import { Cinema } from '@/types';
import { motion } from 'framer-motion';

const CinemasManagement = () => {
  const { 
    cinemas, 
    loadData, 
    addCinema, 
    updateCinema, 
    deleteCinema, 
    toggleCinemaStatus 
  } = useMoviesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [deletingCinema, setDeletingCinema] = useState<Cinema | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCinemas = cinemas.filter(cinema =>
    cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cinema.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Cinemas</h1>
          <p className="text-muted-foreground">
            Adicione e gerencie cinemas e suas localizações
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cinema
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
            placeholder="Buscar cinemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCinemas.length} cinema{filteredCinemas.length !== 1 ? 's' : ''} encontrado{filteredCinemas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Cinemas List */}
      {filteredCinemas.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhum cinema encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cinema'}
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Cinema
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCinemas.map((cinema, index) => (
            <motion.div
              key={cinema.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cinema.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{cinema.city}</p>
                      </div>
                    </div>
                    <Badge variant={cinema.isActive ? "default" : "secondary"}>
                      {cinema.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{cinema.address}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCinema(cinema)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleCinemaStatus(cinema.id);
                        showSuccess(`Cinema ${cinema.isActive ? 'desativado' : 'ativado'} com sucesso!`);
                      }}
                      className={cinema.isActive ? "text-orange-600" : "text-green-600"}
                    >
                      {cinema.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCinema(cinema)}
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
      {(showForm || editingCinema) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingCinema ? 'Editar Cinema' : 'Adicionar Cinema'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">Formulário em desenvolvimento...</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingCinema(null);
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
      <AlertDialog open={!!deletingCinema} onOpenChange={() => setDeletingCinema(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cinema "{deletingCinema?.name}"? 
              Esta ação não pode ser desfeita e removerá todas as salas e sessões associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingCinema) {
                  deleteCinema(deletingCinema.id);
                  setDeletingCinema(null);
                  showSuccess('Cinema removido com sucesso!');
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Cinema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CinemasManagement;