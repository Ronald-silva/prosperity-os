import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransactionDialogProps {
  type: "gain" | "spend";
  onSuccess: () => void;
}

const SPEND_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Contas",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros"
];

const GAIN_CATEGORIES = [
  "Salário",
  "Freela",
  "Investimento",
  "Presente",
  "Outros"
];

export const TransactionDialog = ({ type, onSuccess }: TransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [essential, setEssential] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type,
        value: parseFloat(value),
        description,
        category,
        essential: type === "spend" ? essential : false,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast.success(type === "gain" ? "Ganho registrado!" : "Gasto registrado!");
      setOpen(false);
      setValue("");
      setDescription("");
      setCategory("");
      setEssential(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar transação");
    } finally {
      setLoading(false);
    }
  };

  const categories = type === "spend" ? SPEND_CATEGORIES : GAIN_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`flex-1 ${
            type === "gain"
              ? "bg-gradient-to-r from-success to-primary hover:opacity-90"
              : "bg-gradient-to-r from-warning to-accent hover:opacity-90"
          }`}
        >
          {type === "gain" ? (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Ganhei Dinheiro
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 mr-2" />
              Gastei Dinheiro
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "gain" ? "Registrar Ganho" : "Registrar Gasto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {type === "spend" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="essential"
                checked={essential}
                onCheckedChange={setEssential}
              />
              <Label htmlFor="essential" className="cursor-pointer">
                É um gasto essencial?
              </Label>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
