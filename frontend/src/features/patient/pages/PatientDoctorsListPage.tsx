import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllDoctors } from "@/services/profile";

export const PatientDoctorsListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["all-doctors"],
    queryFn: () => getAllDoctors(),
  });

  const filteredDoctors = doctors?.content?.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const API_BASE_URL = "http://localhost:9000";

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Encontrar Médicos</h1>
          <p className="text-muted-foreground">
            Conheça nossa equipe de especialistas e agende sua consulta.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou especialidade..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors?.map((doctor) => (
            <Card
              key={doctor.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-col items-center text-center pb-2">
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary/10">
                  <AvatarImage
                    src={
                      doctor.profilePictureUrl
                        ? `${API_BASE_URL}${doctor.profilePictureUrl}`
                        : undefined
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {doctor.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">Dr. {doctor.name}</h3>
                <Badge variant="secondary" className="mt-2">
                  {doctor.specialization || "Clínico Geral"}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>{doctor.department || "Departamento Médico"}</span>
                </div>
                <p className="line-clamp-3 px-4">
                  {doctor.biography ||
                    "O Dr. é um especialista dedicado com vasta experiência..."}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild className="w-full">
                  <Link to={`/patient/doctors/${doctor.id}`}>
                    Ver Perfil Completo
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredDoctors?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum médico encontrado com esses termos.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
