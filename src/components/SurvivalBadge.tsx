import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SurvivalBadgeProps {
  dailyBudget: number;
  daysUntilPayment: number;
}

export const SurvivalBadge = ({ dailyBudget, daysUntilPayment }: SurvivalBadgeProps) => {
  const isLowBudget = dailyBudget < 30;
  
  return (
    <Card className={`p-4 md:p-6 ${isLowBudget ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-2">
        {isLowBudget && <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />}
        <h2 className="text-base md:text-lg font-semibold">Saldo de Sobrevivência</h2>
      </div>
      <div className="space-y-1 md:space-y-2">
        <p className="text-3xl md:text-4xl font-bold text-primary">
          R$ {dailyBudget.toFixed(2)}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          por dia para ALMOÇO e GASOLINA
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          pelos próximos {daysUntilPayment} dias
        </p>
      </div>
      {isLowBudget && (
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-destructive/20 rounded-lg">
          <p className="text-xs md:text-sm font-semibold text-destructive">
            ⚠️ Orçamento crítico! Ative o Modo Sobrevivência
          </p>
        </div>
      )}
    </Card>
  );
};
