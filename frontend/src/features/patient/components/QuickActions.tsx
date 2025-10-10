import { Button } from "@/components/ui/button";
import { CalendarPlus, History } from "lucide-react";
import { Link } from "react-router";

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Button asChild size="lg" className="h-auto py-6">
        <Link to="/patient/appointments">
          <div className="flex flex-col items-center justify-center text-center text-secondary">
            <CalendarPlus className="h-8 w-8 mb-2" />
            <span className="text-base font-semibold">
              Agendar Nova Consulta
            </span>
          </div>
        </Link>
      </Button>
      <Button asChild size="lg" className="h-auto py-6" variant="outline">
        <Link to="/patient/medical-history">
          <div className="flex flex-col items-center justify-center text-center">
            <History className="h-8 w-8 mb-2" />
            <span className="text-base font-semibold">
              Ver Histórico Médico
            </span>
          </div>
        </Link>
      </Button>
    </div>
  );
};
