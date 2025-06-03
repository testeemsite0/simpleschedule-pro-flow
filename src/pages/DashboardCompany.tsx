
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyData {
  company_name: string;
  display_name: string;
  company_type: string;
}

const DashboardCompany = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    display_name: '',
    company_type: 'individual'
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const fetchCompanyData = async () => {
    if (!user) return;
    
    try {
      console.log('DashboardCompany: Fetching company data for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, display_name, company_type')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('DashboardCompany: Error fetching company data:', error);
        throw error;
      }
      
      console.log('DashboardCompany: Company data loaded:', data);
      setCompanyData({
        company_name: data?.company_name || '',
        display_name: data?.display_name || user.name || '',
        company_type: data?.company_type || 'individual'
      });
    } catch (error) {
      console.error('DashboardCompany: Error fetching company data:', error);
      toast.error('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      console.log('DashboardCompany: Saving company data:', companyData);
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyData.company_name || null,
          display_name: companyData.display_name,
          company_type: companyData.company_type
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('DashboardCompany: Error saving company data:', error);
        throw error;
      }
      
      console.log('DashboardCompany: Company data saved successfully');
      setSaved(true);
      toast.success('Dados da empresa salvos com sucesso!', {
        description: 'As informações foram atualizadas no sistema.',
      });
    } catch (error) {
      console.error('DashboardCompany: Error saving company data:', error);
      toast.error('Erro ao salvar dados da empresa', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Dados da Empresa">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dados da Empresa">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-blue-600" />
          <p className="text-muted-foreground">
            Configure os dados da sua empresa ou estabelecimento que aparecerão no sistema de agendamento público.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Estes dados serão exibidos para seus clientes no sistema de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_type">Tipo de Negócio</Label>
                <Select 
                  value={companyData.company_type} 
                  onValueChange={(value) => handleInputChange('company_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Profissional Liberal</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Nome de Exibição *</Label>
                <Input
                  id="display_name"
                  value={companyData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Nome que aparecerá no sistema"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este nome aparecerá como "Agendar com [Nome]"
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa/Estabelecimento</Label>
              <Input
                id="company_name"
                value={companyData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Ex: Clínica São José, Consultório Dr. Silva..."
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco se for profissional liberal individual
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving || !companyData.display_name}
                className="min-w-32"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCompany;
