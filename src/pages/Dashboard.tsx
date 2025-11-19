import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { SurvivalBadge } from "@/components/SurvivalBadge";
import { TransactionDialog } from "@/components/TransactionDialog";
import { BillCard } from "@/components/BillCard";
import { PiggyCard } from "@/components/PiggyCard";
import { MentorCard } from "@/components/MentorCard";
import { BillDialog } from "@/components/BillDialog";
import { PiggyDialog } from "@/components/PiggyDialog";
import { SpendingChart } from "@/components/SpendingChart";

interface Profile {
  survival_mode: boolean;
}

interface Bill {
  id: string;
  name: string;
  value: number;
  due_day: number;
  paid: boolean;
}

interface Piggy {
  id: string;
  name: string;
  goal: number;
  current: number;
  priority: number;
}

const MENTOR_MESSAGES = [
  {
    message: "Prepare seus trabalhos por fora. Separe o dinheiro das contas assim que receber.",
    author: "Salomão"
  },
  {
    message: "Só gaste com o que traz valor real. Evite gastos impulsivos.",
    author: "Warren Buffett"
  },
  {
    message: "O primeiro passo para a riqueza é gastar menos do que você ganha.",
    author: "Benjamin Franklin"
  }
];

interface Transaction {
  id: string;
  type: string;
  value: number;
  date: string;
  category: string;
  description: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [piggies, setPiggies] = useState<Piggy[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      const [profileRes, billsRes, piggiesRes, transactionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("bills").select("*").eq("user_id", userId).order("due_day"),
        supabase.from("piggies").select("*").eq("user_id", userId).order("priority"),
        supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (billsRes.data) setBills(billsRes.data);
      if (piggiesRes.data) setPiggies(piggiesRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo total
  const calculateBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === "gain" ? acc + t.value : acc - t.value;
    }, 0);
  };

  const calculateIncome = () => {
    return transactions
      .filter((t) => t.type === "gain")
      .reduce((acc, t) => acc + t.value, 0);
  };

  const calculateExpenses = () => {
    return transactions
      .filter((t) => t.type === "spend")
      .reduce((acc, t) => acc + t.value, 0);
  };

  // Calcular contas pendentes dos próximos 7 dias
  const getUpcomingBills = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    return bills.filter(bill => {
      if (bill.paid) return false;
      
      const dueDay = bill.due_day;
      let daysUntilDue = dueDay - currentDay;
      
      // Se a conta é de um dia anterior no mês, considerar o próximo mês
      if (daysUntilDue < 0) {
        daysUntilDue = daysInMonth - currentDay + dueDay;
      }
      
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    });
  };

  // Calcular total de contas pendentes
  const getTotalUnpaidBills = () => {
    return bills.filter(b => !b.paid).reduce((acc, b) => acc + b.value, 0);
  };

  // Calcular orçamento diário
  const calculateDailyBudget = () => {
    const balance = calculateBalance();
    const unpaidBills = getTotalUnpaidBills();
    const availableMoney = balance - unpaidBills;
    
    // Assume próximo pagamento em 30 dias (pode ser configurável depois)
    const daysUntilPayment = 30;
    
    return availableMoney / daysUntilPayment;
  };

  // Calcular dias até próximo pagamento (placeholder - pode ser melhorado)
  const getDaysUntilPayment = () => {
    return 30; // Placeholder - pode adicionar configuração depois
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleSurvivalMode = async () => {
    if (!user) return;
    
    const newMode = !profile?.survival_mode;
    const { error } = await supabase
      .from("profiles")
      .update({ survival_mode: newMode })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao alterar modo");
    } else {
      setProfile({ ...profile, survival_mode: newMode } as Profile);
      toast.success(newMode ? "Modo Sobrevivência ativado!" : "Modo Sobrevivência desativado");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const balance = calculateBalance();
  const totalIncome = calculateIncome();
  const totalExpenses = calculateExpenses();
  const dailyBudget = calculateDailyBudget();
  const daysUntilPayment = getDaysUntilPayment();
  const upcomingBills = getUpcomingBills();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Prosperity OS
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={profile?.survival_mode ? "destructive" : "outline"}
              size="sm"
              onClick={toggleSurvivalMode}
              className="hidden md:flex"
            >
              {profile?.survival_mode ? (
                <>
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Desativar Sobrevivência
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Modo Sobrevivência
                </>
              )}
            </Button>
            <Button
              variant={profile?.survival_mode ? "destructive" : "outline"}
              size="icon"
              onClick={toggleSurvivalMode}
              className="md:hidden"
            >
              {profile?.survival_mode ? (
                <ShieldOff className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <div className="bg-card p-3 md:p-4 rounded-xl border shadow-sm">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">Receitas</p>
            <p className="text-base md:text-2xl font-bold text-green-500 truncate">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-xl border shadow-sm">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">Despesas</p>
            <p className="text-base md:text-2xl font-bold text-red-500 truncate">R$ {totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-xl border shadow-sm">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">Saldo Atual</p>
            <p className="text-base md:text-2xl font-bold text-primary truncate">R$ {balance.toFixed(2)}</p>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-xl border shadow-sm">
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">Disponível</p>
            <p className="text-base md:text-2xl font-bold text-success truncate">R$ {(balance - getTotalUnpaidBills()).toFixed(2)}</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-3 md:hidden">Ações Rápidas</h2>
          <div className="flex gap-3">
            <TransactionDialog type="gain" onSuccess={() => loadData(user!.id)} />
            <TransactionDialog type="spend" onSuccess={() => loadData(user!.id)} />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Charts & Bills */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Análise de Gastos</h2>
              <SpendingChart transactions={transactions} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Contas Próximas</h2>
                <BillDialog onSuccess={() => loadData(user!.id)} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                 <div className="bg-card p-4 rounded-xl border shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pendente (Mês)</p>
                      <p className="text-2xl font-bold text-warning">R$ {getTotalUnpaidBills().toFixed(2)}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                {upcomingBills.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Nenhuma conta urgente para os próximos 7 dias</p>
                  </div>
                ) : (
                  upcomingBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      {...bill}
                      dueDay={bill.due_day}
                      onUpdate={() => loadData(user!.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Piggies & Mentor */}
          <div className="space-y-8">
             <section>
              <SurvivalBadge dailyBudget={dailyBudget} daysUntilPayment={daysUntilPayment} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Meus Cofrinhos</h2>
                <PiggyDialog onSuccess={() => loadData(user!.id)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {piggies.map((piggy) => (
                  <PiggyCard
                    key={piggy.id}
                    {...piggy}
                    onUpdate={() => loadData(user!.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Conselho do Mentor</h2>
              <MentorCard
                message={MENTOR_MESSAGES[0].message}
                author={MENTOR_MESSAGES[0].author}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
