import { useState, useEffect, useRef } from "react";
import { X, ChevronsUpDown, Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: string;
}

export const MultiCombobox = ({
  options,
  value = [],
  onChange,
  placeholder = "Selecione opções...",
  className,
  disabled = false,
  maxHeight = "200px",
}: MultiComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Reset input when closing
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      // Remove if already selected
      onChange(value.filter((item) => item !== selectedValue));
    } else {
      // Add if not selected
      onChange([...value, selectedValue]);
    }
    // Keep popover open for multiple selections
  };

  const handleAddCustom = (customValue: string) => {
    const trimmedValue = customValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
    }
    setInputValue("");
  };

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(value.filter((item) => item !== valueToRemove));
  };

  // Get display labels for selected values
  const selectedLabels = value.map((val) => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : val;
  });

  // Filter options based on input
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches existing option or selected value
  const inputMatchesExisting =
    filteredOptions.some(
      (option) => option.label.toLowerCase() === inputValue.toLowerCase()
    ) || value.some((val) => val.toLowerCase() === inputValue.toLowerCase());

  const showAddCustomOption =
    inputValue.trim().length > 0 && !inputMatchesExisting;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal h-auto min-h-10 p-3",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label, index) => {
                  const originalValue = value[index];
                  return (
                    <Badge
                      key={`${originalValue}-${index}`}
                      variant="secondary"
                      className="text-xs hover:bg-secondary/80 cursor-pointer transition-colors"
                      onClick={(e) => handleRemove(originalValue, e)}
                    >
                      {label}
                      <X className="ml-1 h-3 w-3 hover:text-destructive transition-colors" />
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground text-sm">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar ou adicionar..."
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9"
            />
            <CommandList style={{ maxHeight }}>
              <CommandEmpty>
                {inputValue.trim().length === 0
                  ? "Digite para buscar sintomas"
                  : "Nenhum sintoma encontrado"}
              </CommandEmpty>

              {/* Existing options */}
              {filteredOptions.length > 0 && (
                <CommandGroup heading="Sintomas disponíveis">
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          value.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {value.includes(option.value) && (
                          <Check className="h-3 w-3 text-secondary" />
                        )}
                      </div>
                      <span className="flex-1">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Add custom option */}
              {showAddCustomOption && (
                <CommandGroup heading="Adicionar novo">
                  <CommandItem
                    value={`add-custom-${inputValue}`}
                    onSelect={() => handleAddCustom(inputValue)}
                    className="cursor-pointer text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Adicionar "{inputValue}"</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>

            {/* Footer with action buttons */}
            <div className="border-t p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {value.length} selecionado{value.length !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-1">
                  {value.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange([]);
                      }}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Limpar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="h-7 px-2 text-xs"
                  >
                    Concluído
                  </Button>
                </div>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
