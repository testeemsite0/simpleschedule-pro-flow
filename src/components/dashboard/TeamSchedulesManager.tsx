
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TeamMember, TimeSlot } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberWithSchedule extends TeamMember {
  schedulesCount: number;
}

const TeamSchedulesManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user) return;
      
      try {
        // Get all team members
        const { data: teamMembersData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('professional_id', user.id)
          .eq('active', true);
          
        if (teamError) throw teamError;
        
        if (!teamMembersData) {
          setTeamMembers([]);
          setLoading(false);
          return;
        }
        
        // For each team member, get their time slots count
        const membersWithSchedules = await Promise.all(
          teamMembersData.map(async (member) => {
            const { count, error: countError } = await supabase
              .from('time_slots')
              .select('*', { count: 'exact' })
              .eq('team_member_id', member.id);
              
            if (countError) {
              console.error("Error counting schedules for member:", countError);
              return { ...member, schedulesCount: 0 };
            }
            
            return { ...member, schedulesCount: count || 0 };
          })
        );
        
        setTeamMembers(membersWithSchedules);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, [user]);
  
  const handleManageSchedules = (memberId: string) => {
    navigate(`/dashboard/team/${memberId}/schedules`);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciar horários por membro da equipe</h2>
      <p className="text-muted-foreground">
        Defina horários específicos para cada membro da sua equipe.
      </p>
      
      {loading ? (
        <p>Carregando membros da equipe...</p>
      ) : teamMembers.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p>Você ainda não tem membros em sua equipe.</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => navigate('/dashboard/team')}
              >
                Gerenciar equipe
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map(member => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    {member.position && (
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {member.schedulesCount} horário{member.schedulesCount !== 1 ? 's' : ''} configurado{member.schedulesCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant={member.schedulesCount > 0 ? "secondary" : "outline"}>
                    {member.schedulesCount > 0 ? 'Configurado' : 'Não configurado'}
                  </Badge>
                </div>
                
                <Button 
                  onClick={() => handleManageSchedules(member.id)} 
                  className="w-full"
                  variant="outline"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Gerenciar horários
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamSchedulesManager;
