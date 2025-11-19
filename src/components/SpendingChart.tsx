import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  type: string;
  value: number;
  category: string;
}

interface SpendingChartProps {
  transactions: Transaction[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export const SpendingChart = ({ transactions }: SpendingChartProps) => {
  const spendTransactions = transactions.filter((t) => t.type === "spend");

  const data = spendTransactions.reduce((acc: any[], t) => {
    const existingCategory = acc.find((item) => item.name === t.category);
    if (existingCategory) {
      existingCategory.value += t.value;
    } else {
      acc.push({ name: t.category, value: t.value });
    }
    return acc;
  }, []);

  // Sort by value descending
  data.sort((a, b) => b.value - a.value);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum gasto registrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
