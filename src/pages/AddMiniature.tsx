import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Upload, 
  Car, 
  Save, 
  Loader2, 
  X,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MiniatureData {
  model_name: string;
  brand: string;
  launch_year: number | null;
  series: string;
  collection_number: string;
  base_color: string;
  acquisition_date: string;
  price_paid: number | null;
  condition: string;
  variants: string;
  is_treasure_hunt: boolean;
  is_super_treasure_hunt: boolean;
  personal_notes: string;
}

export default function AddMiniature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [blisterImage, setBlisterImage] = useState<File | null>(null);
  const [blisterImagePreview, setBlisterImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState<MiniatureData>({
    model_name: "",
    brand: "",
    launch_year: null,
    series: "",
    collection_number: "",
    base_color: "",
    acquisition_date: new Date().toISOString().split('T')[0],
    price_paid: null,
    condition: "sealed",
    variants: "",
    is_treasure_hunt: false,
    is_super_treasure_hunt: false,
    personal_notes: "",
  });

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBlisterImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBlisterImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeBlisterImage = async () => {
    if (!blisterImage) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, tire uma foto ou selecione uma imagem do blister primeiro.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingImage(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Here we would call an AI service to analyze the image
        // For now, we'll simulate the analysis
        setTimeout(() => {
          // Simulate AI analysis result
          setFormData({
            ...formData,
            model_name: "'89 Mercedes-Benz 560 SEC AMG",
            brand: "Hot Wheels",
            launch_year: 2023,
            series: "HW: The '80s",
            collection_number: "3/5",
            base_color: "Prata",
          });
          
          toast({
            title: "Análise concluída!",
            description: "Os dados foram extraídos da imagem. Verifique e corrija se necessário.",
          });
          
          setAnalyzingImage(false);
        }, 2000);
      };
      reader.readAsDataURL(blisterImage);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a imagem. Preencha os dados manualmente.",
        variant: "destructive",
      });
      setAnalyzingImage(false);
    }
  };

  const handleInputChange = (field: keyof MiniatureData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.model_name || !formData.brand) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do modelo e marca são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, check if this miniature already exists in master database
      const { data: existingMiniature, error: searchError } = await supabase
        .from('miniatures_master')
        .select('id')
        .eq('model_name', formData.model_name)
        .eq('brand', formData.brand)
        .eq('launch_year', formData.launch_year || null)
        .eq('series', formData.series || null)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching miniature:', searchError);
      }

      let miniatureId = existingMiniature?.id;

      // If miniature doesn't exist in master database, create it
      if (!miniatureId) {
        let blisterPhotoUrl = "";
        
        // Upload blister image if provided
        if (blisterImage) {
          const fileName = `${Date.now()}-${blisterImage.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blister-photos')
            .upload(`${user?.id}/${fileName}`, blisterImage);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('blister-photos')
              .getPublicUrl(uploadData.path);
            blisterPhotoUrl = publicUrl;
          }
        }

        const { data: newMiniature, error: createError } = await supabase
          .from('miniatures_master')
          .insert({
            model_name: formData.model_name,
            brand: formData.brand,
            launch_year: formData.launch_year,
            series: formData.series,
            collection_number: formData.collection_number,
            base_color: formData.base_color,
            official_blister_photo_url: blisterPhotoUrl,
          })
          .select('id')
          .single();

        if (createError) {
          throw createError;
        }

        miniatureId = newMiniature.id;
      }

      // Add miniature to user collection
      const { error: userMiniatureError } = await supabase
        .from('user_miniatures')
        .insert({
          user_id: user?.id,
          miniature_id: miniatureId,
          acquisition_date: formData.acquisition_date || null,
          price_paid: formData.price_paid,
          condition: formData.condition,
          variants: formData.variants,
          is_treasure_hunt: formData.is_treasure_hunt,
          is_super_treasure_hunt: formData.is_super_treasure_hunt,
          personal_notes: formData.personal_notes,
        });

      if (userMiniatureError) {
        throw userMiniatureError;
      }

      toast({
        title: "Miniatura adicionada!",
        description: "Sua nova miniatura foi adicionada à coleção com sucesso.",
      });

      navigate('/garage');
    } catch (error: any) {
      console.error('Error adding miniature:', error);
      toast({
        title: "Erro ao adicionar miniatura",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Adicionar Miniatura 🏎️
          </h1>
          <p className="text-muted-foreground">
            Fotografe o blister ou preencha os dados manualmente
          </p>
        </div>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">📸 Fotografar Blister</TabsTrigger>
            <TabsTrigger value="manual">✍️ Preencher Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-6">
            {/* Camera Section */}
            <Card className="card-garage">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-primary" />
                  Captura Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                {blisterImagePreview ? (
                  <div className="relative">
                    <img
                      src={blisterImagePreview}
                      alt="Blister preview"
                      className="w-full max-w-md mx-auto rounded-lg border border-border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBlisterImage(null);
                        setBlisterImagePreview("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Tire uma foto do blister ou selecione uma imagem
                    </p>
                  </div>
                )}

                {/* Camera Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Usar Câmera
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher Arquivo
                  </Button>
                  <Button 
                    className="btn-garage flex-1"
                    onClick={analyzeBlisterImage}
                    disabled={!blisterImage || analyzingImage}
                  >
                    {analyzingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Analisar Imagem
                      </>
                    )}
                  </Button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageCapture}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageCapture}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="card-garage">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5 text-primary" />
                  Dados da Miniatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Preencha os dados manualmente ou use a análise de imagem acima
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Info */}
          <Card className="card-garage">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_name">Nome do Modelo *</Label>
                  <Input
                    id="model_name"
                    value={formData.model_name}
                    onChange={(e) => handleInputChange('model_name', e.target.value)}
                    placeholder="Ex: '89 Mercedes-Benz 560 SEC AMG"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Ex: Hot Wheels, Matchbox"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="launch_year">Ano de Lançamento</Label>
                  <Input
                    id="launch_year"
                    type="number"
                    value={formData.launch_year || ""}
                    onChange={(e) => handleInputChange('launch_year', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="2023"
                  />
                </div>
                <div>
                  <Label htmlFor="series">Série</Label>
                  <Input
                    id="series"
                    value={formData.series}
                    onChange={(e) => handleInputChange('series', e.target.value)}
                    placeholder="Ex: HW: The '80s"
                  />
                </div>
                <div>
                  <Label htmlFor="collection_number">Número na Coleção</Label>
                  <Input
                    id="collection_number"
                    value={formData.collection_number}
                    onChange={(e) => handleInputChange('collection_number', e.target.value)}
                    placeholder="Ex: 3/5 ou 158/250"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="base_color">Cor Principal</Label>
                <Input
                  id="base_color"
                  value={formData.base_color}
                  onChange={(e) => handleInputChange('base_color', e.target.value)}
                  placeholder="Ex: Azul, Vermelho, Prata"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Specific Data */}
          <Card className="card-garage">
            <CardHeader>
              <CardTitle>Dados da sua Coleção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="acquisition_date">Data de Aquisição</Label>
                  <Input
                    id="acquisition_date"
                    type="date"
                    value={formData.acquisition_date}
                    onChange={(e) => handleInputChange('acquisition_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price_paid">Valor Pago (R$)</Label>
                  <Input
                    id="price_paid"
                    type="number"
                    step="0.01"
                    value={formData.price_paid || ""}
                    onChange={(e) => handleInputChange('price_paid', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="5.50"
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Condição</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sealed">Lacrado</SelectItem>
                      <SelectItem value="loose">Solto</SelectItem>
                      <SelectItem value="damaged">Danificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="variants">Variantes</Label>
                <Input
                  id="variants"
                  value={formData.variants}
                  onChange={(e) => handleInputChange('variants', e.target.value)}
                  placeholder="Ex: Rodas 5SP, Versão ZAMAC"
                />
              </div>

              {/* Treasure Hunt Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_treasure_hunt"
                    checked={formData.is_treasure_hunt}
                    onCheckedChange={(checked) => handleInputChange('is_treasure_hunt', checked)}
                  />
                  <Label htmlFor="is_treasure_hunt">É um Treasure Hunt?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_super_treasure_hunt"
                    checked={formData.is_super_treasure_hunt}
                    onCheckedChange={(checked) => handleInputChange('is_super_treasure_hunt', checked)}
                  />
                  <Label htmlFor="is_super_treasure_hunt">É um Super Treasure Hunt?</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="personal_notes">Notas Pessoais</Label>
                <Textarea
                  id="personal_notes"
                  value={formData.personal_notes}
                  onChange={(e) => handleInputChange('personal_notes', e.target.value)}
                  placeholder="Adicione suas observações sobre esta miniatura..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/garage')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-garage flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Adicionar à Coleção
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}