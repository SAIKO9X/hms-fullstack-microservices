import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/shared/StarRating";
import { createReview } from "@/services/profile";
import { CustomNotification } from "@/components/notifications/CustomNotification";

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: number;
  doctorId: number;
  doctorName: string;
}

export const CreateReviewDialog = ({
  open,
  onOpenChange,
  appointmentId,
  doctorId,
  doctorName,
}: CreateReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-stats", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-reviews", doctorId] });
      onOpenChange(false);
      setRating(0);
      setComment("");
      setError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Erro ao enviar avaliação.";
      setError(msg);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Por favor, selecione uma nota em estrelas.");
      return;
    }
    mutation.mutate({
      appointmentId,
      doctorId,
      rating,
      comment,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar Atendimento</DialogTitle>
          <DialogDescription>
            Como foi sua consulta com Dr(a). {doctorName}?
          </DialogDescription>
        </DialogHeader>

        {error && <CustomNotification variant="error" title={error} />}

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <Label>Sua Nota</Label>
            <StarRating rating={rating} onRatingChange={setRating} size={32} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comentário (Opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
