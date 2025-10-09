import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ReusableComboboxProps {
  options: readonly ComboboxOption[];
  value?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  label?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  disabled = false,
  onValueChange,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Buscar opção...",
  emptyMessage = "Nenhuma opção encontrada.",
  label,
  className,
}: ReusableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label || value || "";

  // Verifica se a opção digitada já existe
  const searchResultExists = options.some(
    (option) => option.label.toLowerCase() === searchValue.toLowerCase()
  );

  const handleSelect = (selectedValue: string) => {
    // Encontrar a opção pelo label selecionado
    const option = options.find(
      (opt) => opt.label.toLowerCase() === selectedValue.toLowerCase()
    );

    if (option) {
      // Se encontrou na lista de opções, usar o value da opção
      onValueChange(option.value);
    } else {
      // Se não encontrou, é um valor customizado - usar o valor digitado
      onValueChange(selectedValue);
    }

    setOpen(false);
    setSearchValue("");
  };

  return (
    <FormItem className={cn("flex flex-col", className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <span className="truncate">{displayLabel || placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    value={option.label} // CommandItem usa label para matching
                    key={option.value}
                    onSelect={() => handleSelect(option.label)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0" // Compara com value
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {searchValue && !searchResultExists && (
                <CommandGroup>
                  <CommandItem
                    value={searchValue}
                    onSelect={() => handleSelect(searchValue)}
                    className="text-primary"
                  >
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                    Adicionar "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
