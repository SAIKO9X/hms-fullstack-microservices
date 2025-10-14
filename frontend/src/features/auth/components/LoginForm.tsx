import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/lib/schemas/auth.schema";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import type { NotificationState } from "@/features/auth/pages/AuthPage";
import { CustomNotification } from "../../../components/notifications/CustomNotification";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRoleRedirect } from "@/hooks/use-redirect";

interface LoginFormProps {
  notification: NotificationState;
  setNotification: (notification: NotificationState) => void;
}

export const LoginForm = ({
  notification,
  setNotification,
}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const { redirectBasedOnRole } = useRoleRedirect();
  const [showPassword, setShowPassword] = useState(false);

  const { status, error, user } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "succeeded" && user) {
      redirectBasedOnRole(user);
    }
  }, [status, user, redirectBasedOnRole]);

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    dispatch(loginUser(values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6 px-8">
          {/* Notificação de sucesso vinda do registro */}
          {notification?.type === "success" && (
            <CustomNotification
              variant="success"
              title={notification.message}
              onDismiss={() => setNotification(null)}
              autoHide
            />
          )}

          {/* Notificação de erro vinda do estado do Redux */}
          {status === "failed" && error && (
            <CustomNotification variant="error" title={error} />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="medico@email.com"
                      className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                  Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
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
