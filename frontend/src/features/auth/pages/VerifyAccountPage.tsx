import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { verifyAccount, resendVerificationCode } from "@/services/auth";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyAccount(emailParam, code);
      navigate("/auth", {
        state: { message: "Conta verificada com sucesso! Faça login." },
      });
    } catch (err: any) {
      setError(err.message || "Erro ao verificar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resendVerificationCode(emailParam);
      setSuccessMsg("Novo código enviado! Verifique seu e-mail.");

      // Inicia cooldown de 30 segundos
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao reenviar código.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 group hover:bg-transparent hover:text-primary pl-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar
        </Button>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-center text-2xl font-bold">
                Verificar Conta
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="text-sm text-center font-semibold text-foreground bg-muted/50 py-1 px-3 rounded-full w-fit mx-auto">
                {emailParam || "seu email"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <CustomNotification
                variant="error"
                title={error}
                onDismiss={() => setError(null)}
              />
            )}

            {successMsg && (
              <CustomNotification
                variant="success"
                title={successMsg}
                onDismiss={() => setSuccessMsg(null)}
              />
            )}

            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    // permite apenas números e limita a 6 dígitos
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(val);
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] h-16 font-bold border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:tracking-normal"
                  autoFocus
                />
                {code.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {code.length}/6
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Digite o código que você recebeu no seu e-mail
              </p>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              onClick={handleVerify}
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                "Confirmar Código"
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline underline-offset-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResendCode}
                  disabled={isResending || resendCooldown > 0}
                >
                  {isResending
                    ? "Enviando..."
                    : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s`
                    : "Reenviar"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-8 px-4 opacity-70">
          Por questões de segurança, este código expira em 15 minutos.
        </p>
      </div>
    </div>
  );
}
