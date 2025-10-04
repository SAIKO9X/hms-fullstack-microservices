import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/hooks/hooks";
import { useProfile } from "@/hooks/profile-queries";
import { ChevronDown, LogOut, Settings, User, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

export const ProfileMenu = ({ onLogout }: { onLogout: () => void }) => {
  const { setTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { profile } = useProfile();

  const roleDisplayMap = {
    DOCTOR: "Doutor",
    PATIENT: "Paciente",
    ADMIN: "Admin",
  };

  const userRoleDisplay = user ? roleDisplayMap[user.role] : "Usuário";
  const API_BASE_URL = "http://localhost:9000"; // URL do Gateway

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer focus-visible:outline-none hover:bg-accent rounded-lg p-2 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                profile?.profilePictureUrl
                  ? `${API_BASE_URL}${profile.profilePictureUrl}`
                  : undefined
              }
              alt="Profile Image"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm text-foreground">
              {user?.name || "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">
              {userRoleDisplay}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoon className="mr-3 h-4 w-4" />
              <span>Tema</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                Sistema
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-400"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
