'use client';

import { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function AIDialog({ isOpen, onClose, onSearch }: AIDialogProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    // Pequeño delay para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSearch(query.trim());
    setIsSearching(false);
    setQuery('');
  };

  const handleClose = () => {
    if (!isSearching) {
      setQuery('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary size-5" />
            Búsqueda con Inteligencia Artificial
          </DialogTitle>
          <DialogDescription>
            Ingresa el concepto o palabras clave sobre el servicio o producto que necesitas
            facturar. Nuestra IA interpretará tu descripción y encontrará la clave SAT más adecuada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-query">Concepto a facturar</Label>
            <textarea
              id="ai-query"
              placeholder="EJ: Desarrollo de aplicación móvil para gestión de inventario..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              aria-label="Concepto a facturar"
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-[100px] w-full min-w-0 resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              Describe tu actividad comercial en lenguaje natural. La IA interpretará tu descripción
              y buscará en el catálogo SAT.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSearching}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!query.trim() || isSearching} className="gap-2">
              <Search className="size-4" />
              {isSearching ? 'Buscando...' : 'Buscar con IA'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
