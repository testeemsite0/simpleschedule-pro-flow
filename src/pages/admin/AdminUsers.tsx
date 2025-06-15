
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminUsers = () => {
  const { loading: accessLoading, hasAccess, AccessDeniedComponent } = useAdminAccess();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (hasAccess) {
      fetchUsers();
    }
  }, [hasAccess]);

  const fetchUsers = async () => {
    try {
      console.log('AdminUsers: Fetching users from profiles table...');
      
      // Buscar dados da tabela profiles com joins para roles e subscribers
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          subscribers(subscription_tier, subscribed)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('AdminUsers: Error fetching users:', error);
        throw error;
      }
      
      console.log('AdminUsers: Successfully fetched users:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('AdminUsers: Error in fetchUsers:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('AdminUsers: Updating role for user:', userId, 'to:', newRole);
      
      const roleValue = newRole as 'professional' | 'secretary' | 'admin';
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: roleValue }, { onConflict: 'user_id' });

      if (error) {
        console.error('AdminUsers: Error updating user role:', error);
        throw error;
      }

      console.log('AdminUsers: Successfully updated user role');
      toast({
        title: 'Sucesso',
        description: 'Role do usuário atualizada',
      });
      
      fetchUsers();
    } catch (error) {
      console.error('AdminUsers: Error in updateUserRole:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar role do usuário: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  if (accessLoading) {
    return (
      <DashboardLayout title="Gerenciar Usuários">
        <div className="flex items-center justify-center py-8">
          <p>Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  if (loading) {
    return (
      <DashboardLayout title="Gerenciar Usuários">
        <div className="text-center py-8">Carregando usuários...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gerenciar Usuários">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.user_roles?.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.user_roles?.role || 'professional'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscribers?.subscribed ? 'default' : 'outline'}>
                      {user.subscribers?.subscription_tier || 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.user_roles?.role || 'professional'}
                      onValueChange={(value) => updateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminUsers;
