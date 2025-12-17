import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBudget } from "../hooks/useAI";

interface SetBudgetDialogProps {
  currentBudget: number;
}

export function SetBudgetDialog({ currentBudget }: SetBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(currentBudget.toString());
  const updateBudgetMutation = useUpdateBudget();

  const handleSave = () => {
    const newBudget = parseFloat(budget);
    if (isNaN(newBudget) || newBudget < 0) {
      return;
    }

    updateBudgetMutation.mutate(newBudget, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogDescription>
            Set the maximum monthly budget for AI usage. Alerts will be triggered
            when usage approaches this limit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget ($)
            </Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={updateBudgetMutation.isPending}
          >
            {updateBudgetMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
