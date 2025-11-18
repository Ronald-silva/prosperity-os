import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BillCardProps {
  id: string;
  name: string;
  value: number;
  dueDay: number;
  paid: boolean;
  onUpdate: () => void;
}

export const BillCard = ({ id, name, value, dueDay, paid, onUpdate }: BillCardProps) => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysUntilDue = dueDay - currentDay;
  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0 && !paid;
  const isOverdue = daysUntilDue < 0 && !paid;

  const handleTogglePaid = async () => {
    try {
      const { error } = await supabase
        .from("bills")
        .update({ paid: !paid })
        .eq("id", id);

      if (error) throw error;

      toast.success(paid ? "Conta marcada como não paga" : "Conta paga!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar conta");
    }
  };

  return (
    <Card
      className={`p-4 ${
        isOverdue
          ? "bg-destructive/20 border-destructive"
          : isUrgent
          ? "bg-warning/20 border-warning"
          : paid
          ? "bg-success/10 border-success"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            R$ {value.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Vence dia {dueDay}</span>
            {isUrgent && !paid && (
              <span className="text-warning font-semibold">
                ({Math.abs(daysUntilDue)} dias!)
              </span>
            )}
            {isOverdue && (
              <span className="text-destructive font-semibold">
                (ATRASADA!)
              </span>
            )}
          </div>
        </div>
        <Button
          variant={paid ? "outline" : "default"}
          size="sm"
          onClick={handleTogglePaid}
          className={paid ? "border-success text-success" : ""}
        >
          {paid ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Paga
            </>
          ) : (
            "Pagar"
          )}
        </Button>
      </div>
    </Card>
  );
};
