"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, Mail, Lock, User, CreditCard } from "lucide-react";
import { CustomNotification } from "../notifications/CustomNotification";
import { RegisterFormSchema } from "@/lib/schemas/auth";
import { registerUser } from "@/services/auth";
import { maskCPF } from "@/lib/masks";

interface RegisterFormProps {
  onRegisterSuccess: (message: string) => void;
}

export const RegisterForm = ({ onRegisterSuccess }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PATIENT",
      cpfOuCrm: "",
    },
  });

  const watchedRole = form.watch("role");

  async function onSubmit(values: z.infer<typeof RegisterFormSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...dataToSend } = values;
      await registerUser(dataToSend);
      onRegisterSuccess("Conta criada com sucesso! Por favor, faça o login.");
      form.reset();
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CardContent className="space-y-4 px-8">
          {error && (
            <CustomNotification
              variant="error"
              title={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                  Nome Completo
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Seu nome completo"
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
                      placeholder="seu@email.com"
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
            name="cpfOuCrm"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel>
                  {watchedRole === "DOCTOR" ? "CRM" : "CPF"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={
                        watchedRole === "DOCTOR"
                          ? "123456/SP"
                          : "000.000.000-00"
                      }
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        const maskedValue =
                          watchedRole === "PATIENT" ? maskCPF(value) : value;
                        field.onChange(maskedValue);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                  Confirmar Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
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

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3 pt-2">
                <FormLabel className="text-sm font-medium text-foreground/80">
                  Você é um...
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-6"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PATIENT" />
                      </FormControl>
                      <FormLabel className="font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        Paciente
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="DOCTOR" />
                      </FormControl>
                      <FormLabel className="font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        Doutor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>

        <CardFooter className="px-8 pb-8">
          <Button
            type="submit"
            className="w-full cursor-pointer h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-secondary font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Criando conta...</span>
              </div>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
