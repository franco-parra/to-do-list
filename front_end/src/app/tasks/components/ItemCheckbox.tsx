import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ItemCheckboxProps {
  item: {
    id: number;
    text: string;
    completed: boolean;
  };
  onToggle: () => void;
  onDelete: () => void;
}

export default function ItemCheckbox({
  item,
  onToggle,
  onDelete,
}: ItemCheckboxProps) {
  return (
    <div className="flex items-center justify-between space-x-2 mb-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.completed}
          onCheckedChange={onToggle}
        />
        <label
          htmlFor={`item-${item.id}`}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            item.completed ? "line-through text-gray-500" : ""
          }`}
        >
          {item.text}
        </label>
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
