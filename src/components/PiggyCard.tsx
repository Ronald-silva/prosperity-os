import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PiggyCardProps {
  id: string;
  name: string;
  goal: number;
  current: number;
  priority: number;
  onUpdate: () => void;
}

const PIGGY_ICONS: { [key: string]: string } = {
  "Fundo de Emergência": "🚨",
  "Bitcoin": "₿",
  "Oportunidades": "💡",
  "Caridade": "🤝",
};

export const PiggyCard = ({ id, name, goal, current, priority, onUpdate }: PiggyCardProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = (current / goal) * 100;
  const icon = PIGGY_ICONS[name] || "💰";

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newAmount = current + parseFloat(amount);
      const { error } = await supabase
        .from("piggies")
        .update({ current: newAmount })
        .eq("id", id);

      if (error) throw error;

      toast.success(`R$ ${amount} adicionado ao cofrinho ${name}!`);
      setOpen(false);
      setAmount("");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar dinheiro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-3xl mb-1">{icon}</div>
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">Prioridade {priority}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao {name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adicionando..." : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">R$ {current.toFixed(2)}</span>
          <span className="font-semibold">R$ {goal.toFixed(2)}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          {progress.toFixed(0)}% da meta
        </p>
      </div>
    </Card>
  );
};
