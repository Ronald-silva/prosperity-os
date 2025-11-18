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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [piggies, setPiggies] = useState<Piggy[]>([]);
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
      const [profileRes, billsRes, piggiesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("bills").select("*").eq("user_id", userId).order("due_day"),
        supabase.from("piggies").select("*").eq("user_id", userId).order("priority"),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (billsRes.data) setBills(billsRes.data);
      if (piggiesRes.data) setPiggies(piggiesRes.data);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
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

  const dailyBudget = 50; // Placeholder - será calculado dinamicamente
  const daysUntilPayment = 15; // Placeholder

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Prosperity OS
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={profile?.survival_mode ? "destructive" : "outline"}
              size="sm"
              onClick={toggleSurvivalMode}
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section>
          <SurvivalBadge dailyBudget={dailyBudget} daysUntilPayment={daysUntilPayment} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Lançamentos</h2>
          <div className="flex gap-3">
            <TransactionDialog type="gain" onSuccess={() => loadData(user!.id)} />
            <TransactionDialog type="spend" onSuccess={() => loadData(user!.id)} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Contas dos Próximos 7 Dias</h2>
          <div className="space-y-3">
            {bills.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma conta cadastrada ainda
              </p>
            ) : (
              bills.map((bill) => (
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

        <section>
          <h2 className="text-xl font-semibold mb-4">Meus Cofrinhos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </main>
    </div>
  );
};

export default Dashboard;
