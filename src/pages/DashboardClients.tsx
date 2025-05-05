
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Mail, Phone } from 'lucide-react';

interface Client {
  name: string;
  email: string;
  phone: string;
  appointmentCount: number;
  lastAppointment: string;
}

const DashboardClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        client => 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.phone && client.phone.includes(searchTerm))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);
  
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all appointments
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id);
        
      if (error) throw error;
      
      if (!appointments || appointments.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }
      
      // Process clients data
      const clientsMap = new Map<string, Client>();
      
      appointments.forEach(appointment => {
        const email = appointment.client_email.toLowerCase();
        
        if (!clientsMap.has(email)) {
          clientsMap.set(email, {
            name: appointment.client_name,
            email: appointment.client_email,
            phone: appointment.client_phone || '',
            appointmentCount: 1,
            lastAppointment: appointment.date
          });
        } else {
          const client = clientsMap.get(email)!;
          client.appointmentCount += 1;
          
          // Update last appointment if this one is more recent
          if (new Date(appointment.date) > new Date(client.lastAppointment)) {
            client.lastAppointment = appointment.date;
          }
        }
      });
      
      // Convert map to array and sort by name
      const clientsList = Array.from(clientsMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setClients(clientsList);
      setFilteredClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Visualize e gerencie seus clientes.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Clientes</CardTitle>
            <CardDescription>
              Histórico de todos os clientes que fizeram agendamentos
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Carregando clientes...</p>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm.trim() !== '' 
                    ? 'Nenhum cliente encontrado com os termos de busca.'
                    : 'Você ainda não tem clientes cadastrados.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Último Agendamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.appointmentCount}</TableCell>
                      <TableCell>
                        {new Date(client.lastAppointment).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardClients;
