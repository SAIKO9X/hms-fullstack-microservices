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
import { CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Lock, User } from "lucide-react";
import { CustomNotification } from "../../../components/notifications/CustomNotification";
import { RegisterFormSchema } from "@/lib/schemas/auth.schema";
import { registerUser } from "@/services/auth";
import { maskCPF } from "@/utils/masks";
import { useNavigate } from "react-router";
import {
  FormInputWithIcon,
  FormPasswordInput,
} from "@/components/ui/form-fields";
import { Input } from "@/components/ui/input";

export const RegisterForm = () => {
  const navigate = useNavigate();
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
      navigate(`/auth/verify?email=${encodeURIComponent(values.email)}`);
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

          <FormInputWithIcon
            control={form.control}
            name="name"
            label="Nome Completo"
            placeholder="Seu nome completo"
            leftIcon={<User className="w-4 h-4" />}
          />

          <FormInputWithIcon
            control={form.control}
            name="email"
            label="Email"
            placeholder="seu@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
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
                  <Input
                    placeholder={
                      watchedRole === "DOCTOR" ? "123456/SP" : "000.000.000-00"
                    }
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      const maskedValue =
                        watchedRole === "PATIENT" ? maskCPF(value) : value;
                      field.onChange(maskedValue);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormPasswordInput
            control={form.control}
            name="password"
            label="Senha"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <FormPasswordInput
            control={form.control}
            name="confirmPassword"
            label="Confirmar Senha"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
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
