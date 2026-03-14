import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoginSchema } from "@/lib/schemas/auth.schema";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, ArrowRight, Timer } from "lucide-react";
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
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

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

  // rodar o contador regressivo do lockout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    if (lockoutTimer > 0) return; // impede submissão se estiver bloqueado

    setUnverifiedEmail(null);
    const resultAction = await dispatch(loginUser(values));

    if (loginUser.rejected.match(resultAction)) {
      const errorMessage = (resultAction.payload as string) || "";
      const lowerError = errorMessage.toLowerCase();

      if (
        lowerError.includes("não verificada") ||
        lowerError.includes("verifique seu e-mail")
      ) {
        setUnverifiedEmail(values.email);
      } else if (
        lowerError.includes("bloqueada") ||
        lowerError.includes("tentativas")
      ) {
        const match = errorMessage.match(/(\d+)\s*minuto/);
        const minutes = match ? parseInt(match[1], 10) : 15;
        setLockoutTimer(minutes * 60);
      }
    }
  }

  const handleNavigateToVerify = () => {
    if (unverifiedEmail) {
      navigate(`/auth/verify?email=${encodeURIComponent(unverifiedEmail)}`);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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

          {status === "failed" &&
            error &&
            !unverifiedEmail &&
            lockoutTimer === 0 && (
              <CustomNotification variant="error" title={error} />
            )}

          {lockoutTimer > 0 && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/8 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                  <Timer className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Conta temporariamente bloqueada
                  </p>
                  <p className="text-sm text-orange-600/80 dark:text-orange-400/70">
                    Muitas tentativas incorretas. Sua conta foi bloqueada por um
                    tempo.Tente novamente:
                  </p>
                  <p className="mt-1 text-2xl font-mono font-bold tracking-widest text-orange-700 dark:text-orange-300">
                    {formatTime(lockoutTimer)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <FormInputWithIcon
            control={form.control}
            name="email"
            label="Email"
            placeholder="medico@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={lockoutTimer > 0}
          />

          <FormPasswordInput
            control={form.control}
            name="password"
            label="Senha"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            disabled={lockoutTimer > 0}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                disabled={lockoutTimer > 0}
                className="w-4 h-4 text-primary bg-transparent border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50"
              />
              <label
                htmlFor="remember"
                className={`text-sm transition-colors ${lockoutTimer > 0 ? "text-muted-foreground opacity-50" : "text-muted-foreground hover:text-foreground cursor-pointer"}`}
              >
                Lembrar de mim
              </label>
            </div>
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
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
            disabled={status === "loading" || lockoutTimer > 0}
          >
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Entrando...</span>
              </div>
            ) : lockoutTimer > 0 ? (
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span>Aguarde {formatTime(lockoutTimer)}</span>
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
