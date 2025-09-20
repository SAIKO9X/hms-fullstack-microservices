import { ProfileMenu } from "@/components/header/ProfileMenu";
import { Activity, Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="flex items-center gap-4 flex-1 justify-end">
      <div className="hidden lg:flex items-center gap-4 mr-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-300">
            42 Pacientes Ativos
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            12 Cirurgias Hoje
          </span>
        </div>
      </div>
      <Button variant="outline" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
      </Button>
      <ProfileMenu onLogout={onLogout} />
    </div>
  );
};
