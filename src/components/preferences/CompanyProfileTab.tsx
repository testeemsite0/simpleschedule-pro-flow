
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimezoneSelector } from './TimezoneSelector';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { toast } from 'sonner';
import { Building2, Save, Check } from 'lucide-react';

const COMPANY_TYPES = {
  individual: 'Profissional Liberal',
  clinic: 'Clínica',
  hospital: 'Hospital',
  company: 'Empresa',
  other: 'Outro'
} as const;

export const CompanyProfileTab: React.FC = () => {
  const { settings, loading, updateSettings } = useCompanySettings();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    company_name: '',
    company_type: 'individual',
    timezone: 'America/Sao_Paulo',
    address: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        display_name: settings.display_name || '',
        company_name: settings.company_name || '',
        company_type: settings.company_type || 'individual',
        timezone: settings.timezone || 'America/Sao_Paulo',
        address: settings.address || '',
        phone: settings.phone || '',
        website: settings.website || ''
      });
    }
  }, [settings]);

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const success = await updateSettings(formData);
      if (success) {
        setSaved(true);
        toast.success('Perfil da empresa salvo com sucesso!', {
          description: 'As configurações foram atualizadas.',
        });
      } else {
        toast.error('Erro ao salvar perfil da empresa', {
          description: 'Tente novamente em alguns instantes.',
        });
      }
    } catch (error) {
      console.error('CompanyProfileTab: Error saving:', error);
      toast.error('Erro ao salvar perfil da empresa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-blue-600" />
        <p className="text-muted-foreground">
          Configure os dados da sua empresa que aparecerão no sistema de agendamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de Exibição *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Nome que aparecerá no sistema"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_type">Tipo de Negócio</Label>
              <Select 
                value={formData.company_type} 
                onValueChange={(value) => handleInputChange('company_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPANY_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa/Estabelecimento</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Ex: Clínica São José, Consultório Dr. Silva..."
            />
          </div>

          <TimezoneSelector
            value={formData.timezone}
            onChange={(value) => handleInputChange('timezone', value)}
            label="Fuso Horário da Empresa"
          />

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Endereço completo da empresa"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.suaempresa.com.br"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving || !formData.display_name}
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
  );
};
