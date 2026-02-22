import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StarRating } from "@/components/shared/StarRating";
import {
  createReview,
  getMyReviewForDoctor,
  updateReview,
} from "@/services/profile";
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: existingReview, isLoading: isLoadingReview } = useQuery({
    queryKey: ["my-review", doctorId],
    queryFn: () => getMyReviewForDoctor(doctorId),
    enabled: open,
  });

  const isEditing = !!existingReview;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  useEffect(() => {
    if (existingReview) {
      form.reset({
        rating: existingReview.rating,
        comment: existingReview.comment || "",
      });
    } else {
      form.reset({ rating: 0, comment: "" });
    }
  }, [existingReview, form]);

  const mutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      if (isEditing) {
        return updateReview(doctorId, {
          rating: data.rating,
          comment: data.comment,
        });
      } else {
        return createReview({
          appointmentId,
          doctorId,
          rating: data.rating,
          comment: data.comment || "",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-stats", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor-reviews", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["my-review", doctorId] });

      setError(null);
      setSuccessMsg(
        isEditing
          ? "Avaliação atualizada com sucesso!"
          : "Avaliação enviada com sucesso!",
      );

      setTimeout(() => {
        onOpenChange(false);
        setSuccessMsg(null); // reseta para a próxima vez
      }, 2500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Erro ao salvar avaliação.";
      setError(msg);
      setSuccessMsg(null);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    mutation.mutate(data);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setError(null);
          setSuccessMsg(null);
        }
        onOpenChange(val);
      }}
      title={isEditing ? "Editar Avaliação" : "Avaliar Atendimento"}
      description={
        <>
          Como foi sua consulta com Dr(a). <strong>{doctorName}</strong>?
        </>
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending || isLoadingReview}
      submitLabel={isEditing ? "Salvar Alterações" : "Enviar Avaliação"}
      className="sm:max-w-[425px]"
    >
      {error && (
        <CustomNotification variant="error" title={error} dismissible />
      )}
      {successMsg && (
        <CustomNotification
          variant="success"
          title={successMsg}
          autoHide
          autoHideDelay={2500}
        />
      )}

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
