import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormInputWithIcon } from "@/components/ui/form-fields";
import { ForgotPasswordSchema } from "@/lib/schemas/auth.schema";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 group hover:bg-transparent hover:text-primary pl-0"
        onClick={() => navigate("/auth")}
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Voltar para Login
      </Button>

      <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center px-8 pt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Digite seu e-mail cadastrado. Se ele existir em nossa base,
            enviaremos um link de recuperação.
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg text-center">
              <p className="text-success-foreground font-medium">
                E-mail enviado com sucesso!
              </p>
              <p className="text-sm text-success-foreground/80 mt-2">
                Verifique sua caixa de entrada e a pasta de spam.
              </p>
            </div>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="px-8 space-y-4">
                {error && (
                  <CustomNotification
                    variant="error"
                    title={error}
                    onDismiss={() => setError(null)}
                  />
                )}
                <FormInputWithIcon
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="seu@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </CardContent>
              <CardFooter className="px-8 pb-8">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-secondary transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
}
