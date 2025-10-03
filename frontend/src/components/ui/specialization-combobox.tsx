import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  medicalSpecializations,
  findSpecializationByValue,
} from "@/data/medicalSpecializations";

interface SpecializationComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SpecializationCombobox({
  value,
  onValueChange,
  placeholder = "Selecione uma especialização",
  label = "Especialização",
  className,
}: SpecializationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedSpecialization = findSpecializationByValue(value || "");

  const handleSelect = (selectedValue: string) => {
    // Se o valor já está selecionado, desseleciona
    if (selectedValue === value) {
      onValueChange("");
    } else {
      onValueChange(selectedValue);
    }
    setOpen(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    // Permite que o usuário digite uma especialização personalizada
    if (event.key === "Enter" && searchValue && !selectedSpecialization) {
      event.preventDefault();
      onValueChange(searchValue);
      setOpen(false);
      setSearchValue("");
    }
  };

  const displayValue = selectedSpecialization?.label || value || "";

  return (
    <FormItem className={cn("flex flex-col", className)}>
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "justify-between font-normal",
                !displayValue && "text-muted-foreground"
              )}
            >
              {displayValue || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar especialização..."
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-2 px-4 text-sm">
                  <p>Nenhuma especialização encontrada.</p>
                  {searchValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pressione Enter para adicionar "{searchValue}" como
                      especialização personalizada.
                    </p>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {medicalSpecializations.map((specialization) => (
                  <CommandItem
                    key={specialization.value}
                    value={specialization.label}
                    onSelect={() => handleSelect(specialization.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === specialization.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {specialization.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {searchValue &&
                !medicalSpecializations.some((spec) =>
                  spec.label.toLowerCase().includes(searchValue.toLowerCase())
                ) && (
                  <CommandGroup>
                    <CommandItem
                      value={searchValue}
                      onSelect={() => handleSelect(searchValue)}
                      className="text-primary"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === searchValue ? "opacity-100" : "opacity-0"
                        )}
                      />
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
