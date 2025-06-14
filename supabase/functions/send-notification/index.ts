
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancelled';
  appointmentId: string;
  clientEmail: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
  notes?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getEmailTemplate = (type: string, data: any) => {
  switch (type) {
    case 'appointment_confirmation':
      return {
        subject: `Agendamento Confirmado - ${data.professionalName}`,
        html: `
          <h2>Agendamento Confirmado</h2>
          <p>Olá ${data.clientName},</p>
          <p>Seu agendamento foi confirmado com sucesso!</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Detalhes do Agendamento:</strong><br>
            <strong>Profissional:</strong> ${data.professionalName}<br>
            <strong>Data:</strong> ${data.date}<br>
            <strong>Horário:</strong> ${data.time}<br>
            ${data.notes ? `<strong>Observações:</strong> ${data.notes}<br>` : ''}
          </div>
          <p>Em caso de dúvidas, entre em contato conosco.</p>
          <p>Atenciosamente,<br>${data.professionalName}</p>
        `
      };
    case 'appointment_reminder':
      return {
        subject: `Lembrete: Agendamento Amanhã - ${data.professionalName}`,
        html: `
          <h2>Lembrete de Agendamento</h2>
          <p>Olá ${data.clientName},</p>
          <p>Este é um lembrete do seu agendamento marcado para amanhã.</p>
          <div style="background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Detalhes do Agendamento:</strong><br>
            <strong>Profissional:</strong> ${data.professionalName}<br>
            <strong>Data:</strong> ${data.date}<br>
            <strong>Horário:</strong> ${data.time}<br>
          </div>
          <p>Não se esqueça do seu compromisso!</p>
          <p>Atenciosamente,<br>${data.professionalName}</p>
        `
      };
    case 'appointment_cancelled':
      return {
        subject: `Agendamento Cancelado - ${data.professionalName}`,
        html: `
          <h2>Agendamento Cancelado</h2>
          <p>Olá ${data.clientName},</p>
          <p>Informamos que seu agendamento foi cancelado.</p>
          <div style="background: #ffebee; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Detalhes do Agendamento Cancelado:</strong><br>
            <strong>Profissional:</strong> ${data.professionalName}<br>
            <strong>Data:</strong> ${data.date}<br>
            <strong>Horário:</strong> ${data.time}<br>
          </div>
          <p>Para reagendar, entre em contato conosco.</p>
          <p>Atenciosamente,<br>${data.professionalName}</p>
        `
      };
    default:
      return {
        subject: `Notificação - ${data.professionalName}`,
        html: `<p>Você tem uma nova notificação.</p>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, appointmentId, clientEmail, clientName, professionalName, date, time, notes }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification for appointment ${appointmentId}`);

    const template = getEmailTemplate(type, {
      clientName,
      professionalName,
      date,
      time,
      notes
    });

    const emailResponse = await resend.emails.send({
      from: "Sistema de Agendamentos <noreply@agendamentos.com>",
      to: [clientEmail],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
