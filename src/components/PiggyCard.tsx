import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
};

export const PiggyCard = ({ id, name, goal, current, priority, onUpdate }: PiggyCardProps) => {
  const [open, setOpen] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = Math.min((current / goal) * 100, 100);
  const icon = PIGGY_ICONS[name] || "🐷";

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newValue = current + parseFloat(addValue);
      
      const { error } = await supabase
        .from("piggies")
        .update({ current: newValue })
        .eq("id", id);

      if (error) throw error;

      toast.success("Dinheiro guardado com sucesso!");
      setOpen(false);
      setAddValue("");
      onUpdate();
    } catch (error) {
      toast.error("Erro ao guardar dinheiro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cofrinho?")) return;
    
    try {
      const { error } = await supabase
        .from("piggies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Cofrinho excluído!");
      onUpdate();
    } catch (error) {
      toast.error("Erro ao excluir cofrinho");
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow relative group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl md:text-3xl mb-1">{icon}</div>
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">Prioridade {priority}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">R$ {current.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">de R$ {goal.toFixed(2)}</p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2 mb-4" />
      
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1" variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guardar no {name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor a guardar (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={addValue}
                  onChange={(e) => setAddValue(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Confirmar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Excluir cofrinho"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
