import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export type NotificationState = {
  type: "success" | "error";
  message: string;
} | null;

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [notification, setNotification] = useState<NotificationState>(null);

  const handleRegisterSuccess = (message: string) => {
    setNotification({ type: "success", message });
    setActiveTab("login");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger
            value="login"
            className="h-10 font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Entrar
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="h-10 font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Criar Conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-0">
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 px-8 pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Bem-vindo de volta!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <LoginForm
              notification={notification}
              setNotification={setNotification}
            />
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-0">
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center px-8 pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Crie sua conta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha os campos abaixo para começar
              </CardDescription>
            </CardHeader>
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
