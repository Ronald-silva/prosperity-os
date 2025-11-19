import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BillDialogProps {
  onSuccess: () => void;
}

export const BillDialog = ({ onSuccess }: BillDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const dueDayNum = parseInt(dueDay);
      if (dueDayNum < 1 || dueDayNum > 31) {
        toast.error("Dia de vencimento deve estar entre 1 e 31");
        return;
      }

      const { error } = await supabase.from("bills").insert({
        user_id: user.id,
        name,
        value: parseFloat(value),
        due_day: dueDayNum,
        paid: false,
      });

      if (error) throw error;

      toast.success("Conta adicionada com sucesso!");
      setOpen(false);
      setName("");
      setValue("");
      setDueDay("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conta Fixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              placeholder="Ex: Aluguel, Internet..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDay">Dia do Vencimento</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Dia do mês que a conta vence (1 a 31)
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Adicionar Conta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
