import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BaseDialog } from "./BaseDialog";

interface FormDialogProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Salvar",
  children,
  className,
}: FormDialogProps<T>) {
  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className={className}
      footer={
        <>
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {children}
        </form>
      </Form>
    </BaseDialog>
  );
}
