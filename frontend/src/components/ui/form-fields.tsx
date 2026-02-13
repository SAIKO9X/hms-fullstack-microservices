import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BadgeInput } from "@/components/ui/badge-input";
import { cn } from "@/utils/utils";
import { Combobox } from "./combobox";
import type { Control, FieldValues, Path } from "react-hook-form";

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// --- FORM INPUT ---
interface FormInputProps<T extends FieldValues> extends BaseProps<T> {
  type?: React.HTMLInputTypeAttribute;
  maxLength?: number;
  mask?: (value: string) => string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  className,
  maxLength,
  mask,
  disabled,
  onChange: customOnChange,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                if (customOnChange) {
                  customOnChange(e);
                } else if (mask) {
                  field.onChange(mask(e.target.value));
                } else {
                  field.onChange(e);
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM INPUT COM ÍCONE ---
interface FormInputWithIconProps<
  T extends FieldValues,
> extends FormInputProps<T> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormInputWithIcon<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  className,
  leftIcon,
  rightIcon,
}: FormInputWithIconProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("group", className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {leftIcon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  {leftIcon}
                </div>
              )}
              <Input
                type={type}
                placeholder={placeholder}
                className={cn(
                  "h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border",
                  leftIcon && "pl-10",
                  rightIcon && "pr-10",
                )}
                {...field}
                value={field.value ?? ""}
              />
              {rightIcon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {rightIcon}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

// --- FORM PASSWORD INPUT ---
interface FormPasswordInputProps<T extends FieldValues> extends BaseProps<T> {
  leftIcon?: React.ReactNode;
}

export function FormPasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "••••••••",
  className,
  leftIcon,
}: FormPasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("group", className)}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {leftIcon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  {leftIcon}
                </div>
              )}
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={cn(
                  "h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 hover:border-border pr-10",
                  leftIcon && "pl-10",
                )}
                {...field}
                value={field.value ?? ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

// --- FORM TEXTAREA ---
interface FormTextareaProps<T extends FieldValues> extends BaseProps<T> {
  rows?: number;
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  rows,
  disabled,
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none"
              rows={rows}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM SELECT ---
interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> extends BaseProps<T> {
  options: Option[];
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  options,
  className,
  disabled,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Sem opções
                </div>
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM RADIO GROUP ---
interface FormRadioGroupProps<T extends FieldValues> extends BaseProps<T> {
  options: Option[];
}

export function FormRadioGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  className,
  disabled,
}: FormRadioGroupProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
              className="flex flex-col space-y-1"
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM DATE PICKER ---
interface FormDatePickerProps<T extends FieldValues> extends BaseProps<T> {
  fromYear?: number;
  toYear?: number;
  disabledDate?: (date: Date) => boolean;
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Selecione uma data",
  className,
  fromYear,
  toYear,
  disabledDate,
  disabled,
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(field.value, "PPP", { locale: ptBR })
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabledDate}
                locale={ptBR}
                autoFocus
                captionLayout={fromYear ? "dropdown" : undefined}
                startMonth={fromYear ? new Date(fromYear, 0) : undefined}
                endMonth={toYear ? new Date(toYear, 11) : undefined}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM BADGE INPUT ---
const stringToArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
};

const arrayToString = (value: string[] | undefined | null): string => {
  if (!value) return "";
  return value.join(", ");
};

export function FormBadgeInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "",
  className,
  disabled,
}: BaseProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <BadgeInput
              placeholder={placeholder}
              disabled={disabled}
              value={stringToArray(field.value)}
              onChange={(valueArray) =>
                field.onChange(arrayToString(valueArray))
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- FORM COMBOBOX ---
interface FormComboboxProps<T extends FieldValues> extends BaseProps<T> {
  options: readonly { value: string; label: string }[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function FormCombobox<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  className,
  disabled,
  searchPlaceholder,
  emptyMessage,
}: FormComboboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Combobox
          value={field.value}
          onValueChange={field.onChange}
          options={options}
          label={label}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
          disabled={disabled}
          className={className}
        />
      )}
    />
  );
}
