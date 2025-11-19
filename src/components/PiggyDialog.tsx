import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PiggyDialogProps {
  onSuccess: () => void;
}

export const PiggyDialog = ({ onSuccess }: PiggyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("piggies").insert({
        user_id: user.id,
        name,
        goal: parseFloat(goal),
        current: 0,
        priority: parseInt(priority),
      });

      if (error) throw error;

      toast.success("Cofrinho criado com sucesso!");
      setOpen(false);
      setName("");
      setGoal("");
      setPriority("1");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar cofrinho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-full border-dashed border-2">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cofrinho
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Cofrinho</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              placeholder="Ex: Viagem, Carro Novo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Meta (R$)</Label>
            <Input
              id="goal"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade (1-5)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="5"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Cofrinho"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
