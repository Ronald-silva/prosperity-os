import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SurvivalBadgeProps {
  dailyBudget: number;
  daysUntilPayment: number;
}

export const SurvivalBadge = ({ dailyBudget, daysUntilPayment }: SurvivalBadgeProps) => {
  const isLowBudget = dailyBudget < 30;
  
  return (
    <Card className={`p-6 ${isLowBudget ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
      <div className="flex items-center gap-3 mb-2">
        {isLowBudget && <AlertTriangle className="w-6 h-6 text-destructive" />}
        <h2 className="text-lg font-semibold">Saldo de Sobrevivência</h2>
      </div>
      <div className="space-y-2">
        <p className="text-4xl font-bold text-primary">
          R$ {dailyBudget.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">
          por dia para ALMOÇO e GASOLINA
        </p>
        <p className="text-xs text-muted-foreground">
          pelos próximos {daysUntilPayment} dias
        </p>
      </div>
      {isLowBudget && (
        <div className="mt-4 p-3 bg-destructive/20 rounded-lg">
          <p className="text-sm font-semibold text-destructive">
            ⚠️ Orçamento crítico! Ative o Modo Sobrevivência
          </p>
        </div>
      )}
    </Card>
  );
};
