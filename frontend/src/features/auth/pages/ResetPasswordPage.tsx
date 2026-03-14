import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import { Lock, ShieldCheck } from "lucide-react";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormPasswordInput } from "@/components/ui/form-fields";
import { ResetPasswordSchema } from "@/lib/schemas/auth.schema";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // se o usuário acessar a página sem o token na URL, manda pro login
    if (!token) {
      navigate("/auth", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(token, values.password);
      navigate("/auth", {
        replace: true,
        state: {
          message: "Senha redefinida com sucesso! Faça login com a nova senha.",
        },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center px-8 pt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Crie uma nova senha segura para sua conta.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="px-8 space-y-4">
              {error && (
                <CustomNotification
                  variant="error"
                  title="Erro"
                  description={error}
                  onDismiss={() => setError(null)}
                />
              )}

              <FormPasswordInput
                control={form.control}
                name="password"
                label="Nova Senha"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <FormPasswordInput
                control={form.control}
                name="confirmPassword"
                label="Confirme a Nova Senha"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </CardContent>

            <CardFooter className="px-8 pb-8">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 text-secondary transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
