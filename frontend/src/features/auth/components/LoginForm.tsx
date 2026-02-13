import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoginSchema } from "@/lib/schemas/auth.schema";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import type { NotificationState } from "@/features/auth/pages/AuthPage";
import { CustomNotification } from "../../../components/notifications/CustomNotification";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useLocation, useNavigate } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormInputWithIcon,
  FormPasswordInput,
} from "@/components/ui/form-fields";

interface LoginFormProps {
  notification: NotificationState;
  setNotification: (notification: NotificationState) => void;
}

export const LoginForm = ({
  notification,
  setNotification,
}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { status, error } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        type: "success",
        message: location.state.message,
      });
      setUnverifiedEmail(null);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, setNotification, navigate]);

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setUnverifiedEmail(null);
    const resultAction = await dispatch(loginUser(values));

    if (loginUser.rejected.match(resultAction)) {
      const errorMessage = resultAction.payload as string;
      if (
        errorMessage &&
        (errorMessage.toLowerCase().includes("não verificada") ||
          errorMessage.toLowerCase().includes("verifique seu e-mail"))
      ) {
        setUnverifiedEmail(values.email);
      }
    }
  }

  const handleNavigateToVerify = () => {
    if (unverifiedEmail) {
      navigate(`/auth/verify?email=${encodeURIComponent(unverifiedEmail)}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6 px-8">
          {notification?.type === "success" && (
            <CustomNotification
              variant="success"
              title={notification.message}
              onDismiss={() => setNotification(null)}
              autoHide
            />
          )}

          {unverifiedEmail && (
            <Alert
              variant="destructive"
              className="border-red-500/50 bg-red-500/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Conta não verificada</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-2">
                <p>Sua conta precisa ser verificada antes de entrar.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full bg-background/50 hover:bg-background border-red-200 text-red-600 hover:text-red-700"
                  onClick={handleNavigateToVerify}
                >
                  Digitar Código de Verificação
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === "failed" && error && !unverifiedEmail && (
            <CustomNotification variant="error" title={error} />
          )}

          <FormInputWithIcon
            control={form.control}
            name="email"
            label="Email"
            placeholder="medico@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <FormPasswordInput
            control={form.control}
            name="password"
            label="Senha"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-primary bg-transparent border-border rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Lembrar de mim
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>
        </CardContent>

        <CardFooter className="px-8 pb-8">
          <Button
            type="submit"
            className="w-full cursor-pointer h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-secondary font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Entrando...</span>
              </div>
            ) : (
              "Entrar"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
