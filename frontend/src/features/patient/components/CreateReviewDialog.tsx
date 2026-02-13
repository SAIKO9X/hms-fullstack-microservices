import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StarRating } from "@/components/shared/StarRating";
import { createReview } from "@/services/profile";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormTextarea } from "@/components/ui/form-fields";

const ReviewSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Por favor, selecione uma nota em estrelas." })
    .max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof ReviewSchema>;

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
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-stats", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-reviews", doctorId] });
      onOpenChange(false);
      setError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Erro ao enviar avaliação.";
      setError(msg);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    mutation.mutate({
      appointmentId,
      doctorId,
      rating: data.rating,
      comment: data.comment || "",
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Avaliar Atendimento"
      description={
        <>
          Como foi sua consulta com Dr(a). <strong>{doctorName}</strong>?
        </>
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending}
      submitLabel="Enviar Avaliação"
      className="sm:max-w-[425px]"
    >
      {error && <CustomNotification variant="error" title={error} />}

      <FormField
        control={form.control}
        name="rating"
        render={({ field }) => (
          <FormItem className="flex flex-col items-center gap-2">
            <FormLabel>Sua Nota</FormLabel>
            <FormControl>
              <StarRating
                rating={field.value}
                onRatingChange={field.onChange}
                size={32}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormTextarea
        control={form.control}
        name="comment"
        label="Comentário (Opcional)"
        placeholder="Conte-nos mais sobre sua experiência..."
      />
    </FormDialog>
  );
};
