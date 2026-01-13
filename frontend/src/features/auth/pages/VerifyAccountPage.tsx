import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { verifyAccount } from "@/services/auth";

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Usa o service isolado
      await verifyAccount(emailParam, code);

      // Redireciona para o login com mensagem de sucesso
      navigate("/auth/login", {
        state: { message: "Conta verificada com sucesso! Faça login." },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Verificar Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-center text-gray-500">
            Enviamos um código de 6 dígitos para <br />
            <span className="font-semibold text-foreground">{emailParam}</span>
          </p>

          {error && (
            <CustomNotification
              variant="error"
              title={error}
              onDismiss={() => setError(null)}
            />
          )}

          <div className="space-y-2">
            <Input
              placeholder="000000"
              value={code}
              onChange={(e) => {
                // Remove caracteres não numéricos e limita a 6
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] h-14 font-semibold"
            />
            <p className="text-xs text-center text-muted-foreground">
              Digite o código recebido no seu e-mail
            </p>
          </div>

          <Button
            className="w-full h-12 text-base"
            onClick={handleVerify}
            disabled={isLoading || code.length < 6}
          >
            {isLoading ? "Verificando..." : "Confirmar Código"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
