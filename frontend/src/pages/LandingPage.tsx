import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/hooks";
import { Heart, Activity, Users, Calendar, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleNavigate = () => {
    if (user) {
      const destination =
        user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard";
      navigate(destination);
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description:
        "Controle completo do cadastro e histórico médico dos pacientes com interface intuitiva e segura.",
      color: "primary",
    },
    {
      icon: Activity,
      title: "Controle Cirúrgico",
      description:
        "Acompanhe cirurgias programadas, equipes médicas e recursos necessários em tempo real.",
      color: "green",
    },
    {
      icon: Calendar,
      title: "Agendamentos",
      description:
        "Sistema inteligente de agendamento de consultas e procedimentos com notificações automáticas.",
      color: "purple",
    },
    {
      icon: Shield,
      title: "Segurança",
      description:
        "Proteção avançada de dados médicos com criptografia e controle de acesso baseado em perfis.",
      color: "red",
    },
    {
      icon: Clock,
      title: "Relatórios",
      description:
        "Relatórios detalhados e dashboards em tempo real para tomada de decisões estratégicas.",
      color: "orange",
    },
    {
      icon: Heart,
      title: "Cuidado Integrado",
      description:
        "Coordenação perfeita entre todas as áreas do hospital para um atendimento de excelência.",
      color: "teal",
    },
  ];

  return (
    <div className="h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-10 text-center">
        {/* Hero Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl">
            <Heart className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Hospital Management System
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          A solução completa para gestão hospitalar moderna. Gerencie pacientes,
          cirurgias, agendamentos e muito mais em uma plataforma integrada e
          intuitiva.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Button onClick={handleNavigate} size="lg">
              Ir para o Dashboard
            </Button>
          ) : (
            <Button onClick={handleNavigate} size="lg" variant="outline">
              Login / Criar Conta
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {features.map((feature) => (
            <Card key={feature.title} className="text-left bg-card">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-border">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-muted-foreground">Hospitais Atendidos</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <p className="text-muted-foreground">Pacientes Cadastrados</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <p className="text-muted-foreground">Uptime Garantido</p>
          </div>
        </div>
      </div>
    </div>
  );
};
