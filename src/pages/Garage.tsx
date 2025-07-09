import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Car, 
  Calendar, 
  Tag, 
  Trophy, 
  Star,
  Eye,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Miniature {
  id: string;
  acquisition_date: string;
  condition: string;
  is_treasure_hunt: boolean;
  is_super_treasure_hunt: boolean;
  price_paid: number;
  variants: string;
  personal_notes: string;
  user_photos_urls: string[];
  miniatures_master: {
    id: string;
    model_name: string;
    brand: string;
    launch_year: number;
    series: string;
    base_color: string;
    official_blister_photo_url: string;
  };
}

export default function Garage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [miniatures, setMiniatures] = useState<Miniature[]>([]);
  const [filteredMiniatures, setFilteredMiniatures] = useState<Miniature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [showTreasureHunts, setShowTreasureHunts] = useState("all");

  useEffect(() => {
    if (user) {
      fetchMiniatures();
    }
  }, [user]);

  useEffect(() => {
    filterMiniatures();
  }, [miniatures, searchTerm, selectedBrand, selectedCondition, showTreasureHunts]);

  const fetchMiniatures = async () => {
    try {
      const { data, error } = await supabase
        .from('user_miniatures')
        .select(`
          *,
          miniatures_master (
            id,
            model_name,
            brand,
            launch_year,
            series,
            base_color,
            official_blister_photo_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar coleção",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMiniatures(data || []);
    } catch (error) {
      console.error('Error fetching miniatures:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar sua coleção",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMiniatures = () => {
    let filtered = miniatures;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(miniature =>
        miniature.miniatures_master?.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniature.miniatures_master?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniature.miniatures_master?.series?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      filtered = filtered.filter(miniature =>
        miniature.miniatures_master?.brand === selectedBrand
      );
    }

    // Condition filter
    if (selectedCondition !== "all") {
      filtered = filtered.filter(miniature =>
        miniature.condition === selectedCondition
      );
    }

    // Treasure Hunt filter
    if (showTreasureHunts === "th") {
      filtered = filtered.filter(miniature =>
        miniature.is_treasure_hunt || miniature.is_super_treasure_hunt
      );
    } else if (showTreasureHunts === "sth") {
      filtered = filtered.filter(miniature =>
        miniature.is_super_treasure_hunt
      );
    }

    setFilteredMiniatures(filtered);
  };

  const getUniqueValues = (key: keyof Miniature['miniatures_master']) => {
    const values = miniatures
      .map(m => m.miniatures_master?.[key])
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(v => String(v));
    return values.sort();
  };

  const getConditionLabel = (condition: string) => {
    const labels = {
      sealed: "Lacrado",
      loose: "Solto",
      damaged: "Danificado"
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      sealed: "bg-success/10 text-success border-success/20",
      loose: "bg-warning/10 text-warning border-warning/20", 
      damaged: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[condition as keyof typeof colors] || "bg-muted";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Minha Garagem 🏎️
              </h1>
              <p className="text-muted-foreground">
                {miniatures.length} miniatura{miniatures.length !== 1 ? 's' : ''} em sua coleção
              </p>
            </div>
            <Button 
              className="btn-garage mt-4 sm:mt-0"
              onClick={() => navigate('/add')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Miniatura
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-garage mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar modelo, marca ou série..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Brand Filter */}
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {getUniqueValues('brand').map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as condições</SelectItem>
                  <SelectItem value="sealed">Lacrado</SelectItem>
                  <SelectItem value="loose">Solto</SelectItem>
                  <SelectItem value="damaged">Danificado</SelectItem>
                </SelectContent>
              </Select>

              {/* Treasure Hunt Filter */}
              <Select value={showTreasureHunts} onValueChange={setShowTreasureHunts}>
                <SelectTrigger>
                  <SelectValue placeholder="Treasure Hunts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="th">Treasure Hunts</SelectItem>
                  <SelectItem value="sth">Super Treasure Hunts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Miniatures Grid */}
        {filteredMiniatures.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {miniatures.length === 0 ? 'Sua garagem está vazia' : 'Nenhuma miniatura encontrada'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {miniatures.length === 0 
                ? 'Adicione sua primeira miniatura para começar sua coleção!'
                : 'Tente ajustar os filtros ou fazer uma nova busca.'
              }
            </p>
            {miniatures.length === 0 && (
              <Button 
                className="btn-garage"
                onClick={() => navigate('/add')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Miniatura
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMiniatures.map((miniature) => (
              <Card 
                key={miniature.id} 
                className="card-garage cursor-pointer group"
                onClick={() => navigate(`/miniature/${miniature.id}`)}
              >
                <CardContent className="p-4">
                  {/* Image */}
                  <div className="relative mb-4 bg-surface rounded-lg overflow-hidden">
                    <div className="aspect-square flex items-center justify-center">
                      {miniature.miniatures_master?.official_blister_photo_url || 
                       (miniature.user_photos_urls && miniature.user_photos_urls.length > 0) ? (
                        <img
                          src={miniature.user_photos_urls?.[0] || miniature.miniatures_master?.official_blister_photo_url}
                          alt={miniature.miniatures_master?.model_name}
                          className="w-full h-full object-cover image-hover"
                        />
                      ) : (
                        <Car className="h-16 w-16 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    {/* Badges overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {miniature.is_super_treasure_hunt && (
                        <Badge className="bg-accent/90 text-white text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          STH
                        </Badge>
                      )}
                      {miniature.is_treasure_hunt && !miniature.is_super_treasure_hunt && (
                        <Badge className="bg-secondary/90 text-background text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          TH
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {miniature.miniatures_master?.model_name || 'Modelo não identificado'}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{miniature.miniatures_master?.brand}</span>
                      <span>{miniature.miniatures_master?.launch_year}</span>
                    </div>

                    {miniature.miniatures_master?.series && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {miniature.miniatures_master.series}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Badge className={`text-xs ${getConditionColor(miniature.condition)}`}>
                        {getConditionLabel(miniature.condition)}
                      </Badge>
                      
                      {miniature.acquisition_date && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(miniature.acquisition_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}