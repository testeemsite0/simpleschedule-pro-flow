
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const About = () => {
  return (
    <>
      <Header />
      <main className="py-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Sobre Nós</h1>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Nossa Missão</h2>
              <p className="text-gray-600 mb-6">
                Na SimpleSchedule, temos como missão simplificar o gerenciamento de agendamentos para profissionais autônomos e pequenas empresas, 
                proporcionando uma solução tecnológica acessível que otimiza o tempo e melhora a experiência tanto para os prestadores de serviços 
                quanto para seus clientes.
              </p>
              <p className="text-gray-600">
                Acreditamos que cada minuto economizado em tarefas administrativas é um minuto que pode ser dedicado ao que realmente importa: 
                atender melhor seus clientes e fazer crescer seu negócio.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <blockquote className="italic text-gray-700 border-l-4 border-primary pl-4">
                "Criamos o SimpleSchedule após perceber quantas horas profissionais talentosos perdiam com agendamentos manuais e 
                confirmações por telefone. Nossa plataforma nasceu da necessidade real de otimizar esse processo."
                <footer className="mt-4 font-medium text-gray-900">Ana Silva, Co-fundadora</footer>
              </blockquote>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Nossa Equipe</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Ana Silva" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold">Ana Silva</h3>
                <p className="text-sm text-gray-600">Co-fundadora & CEO</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Carlos Mendes" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold">Carlos Mendes</h3>
                <p className="text-sm text-gray-600">Co-fundador & CTO</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Juliana Costa" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold">Juliana Costa</h3>
                <p className="text-sm text-gray-600">Diretora de Produto</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Nossa História</h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">1</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2021 - O Início</h3>
                  <p className="text-gray-600">A SimpleSchedule nasceu da necessidade real de profissionais autônomos que perdiam clientes devido a processos manuais ineficientes de agendamento.</p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">2</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2022 - Crescimento</h3>
                  <p className="text-gray-600">Após um ano de desenvolvimento e testes, lançamos nossa primeira versão completa, expandindo rapidamente para atender diversos segmentos profissionais.</p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">3</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2023 - Consolidação</h3>
                  <p className="text-gray-600">Com a base de usuários crescendo, melhoramos nossa plataforma com novos recursos e integrações solicitados diretamente pelos nossos clientes.</p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">4</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hoje - Inovação Contínua</h3>
                  <p className="text-gray-600">Continuamos a desenvolver soluções inovadoras para ajudar nossos clientes a crescer, sempre mantendo nosso compromisso com a simplicidade e eficiência.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
