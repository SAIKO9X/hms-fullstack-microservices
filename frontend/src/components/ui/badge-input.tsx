import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BadgeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}

export const BadgeInput = ({
  value = [],
  onChange,
  placeholder,
}: BadgeInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (itemToRemove: string) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1.5"
          >
            {item}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeItem(item)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
