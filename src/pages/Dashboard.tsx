import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Plus, Car, Trophy, Calendar, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  display_name: string;
  total_miniatures: number;
  created_at: string;
}

interface RecentMiniature {
  id: string;
  created_at: string;
  miniatures_master: {
    model_name: string;
    brand: string;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentMiniatures, setRecentMiniatures] = useState<RecentMiniature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchRecentMiniatures();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRecentMiniatures = async () => {
    try {
      const { data, error } = await supabase
        .from('user_miniatures')
        .select(`
          id,
          created_at,
          miniatures_master!inner (
            model_name,
            brand
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent miniatures:', error);
        return;
      }

      setRecentMiniatures(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total de Miniaturas",
      value: profile?.total_miniatures || 0,
      icon: Car,
      description: "Em sua coleção",
    },
    {
      title: "Treasure Hunts",
      value: "0", // Will be calculated later
      icon: Trophy,
      description: "TH e STH encontrados",
    },
    {
      title: "Dias Coletando",
      value: profile?.created_at 
        ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      icon: Calendar,
      description: "Desde que se cadastrou",
    },
    {
      title: "Este Mês",
      value: "0", // Will be calculated later
      icon: TrendingUp,
      description: "Novas adições",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo à sua garagem, {profile?.display_name || 'Colecionador'}! 🏎️
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua coleção de miniaturas die-cast
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="btn-garage flex-1 sm:flex-none"
              onClick={() => navigate('/add')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Miniatura
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/garage')}
              className="flex-1 sm:flex-none"
            >
              <Car className="mr-2 h-5 w-5" />
              Ver Minha Garagem
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-garage">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-garage">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Adições Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ) : recentMiniatures.length > 0 ? (
                <div className="space-y-4">
                  {recentMiniatures.map((miniature) => (
                    <div key={miniature.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {miniature.miniatures_master?.model_name || 'Modelo não identificado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {miniature.miniatures_master?.brand || 'Marca não identificada'} • {' '}
                          {new Date(miniature.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma miniatura ainda.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/add')}
                  >
                    Adicionar primeira miniatura
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-garage">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-secondary" />
                Dicas para Colecionadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">
                    📸 Fotografe o blister
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use a função de leitura automática para catalogar rapidamente suas miniaturas
                  </p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <h4 className="font-semibold text-secondary mb-2">
                    🔍 Treasure Hunts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Marque suas TH e STH para acompanhar essas peças especiais
                  </p>
                </div>
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-accent mb-2">
                    📊 Acompanhe valores
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Registre o valor pago para ter controle dos seus investimentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}