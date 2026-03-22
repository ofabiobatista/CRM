import { useMemo } from "react";
import { Users, TrendingUp, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

const stageLabel = { prospeccao: "Prospecção", qualificacao: "Qualificação", proposta: "Proposta", negociacao: "Negociação", fechado: "Fechado", perdido: "Perdido" };
const stageColor = { prospeccao: "#6366f1", qualificacao: "#8b5cf6", proposta: "#f59e0b", negociacao: "#3b82f6", fechado: "#10b981", perdido: "#ef4444" };
const activityIcon = { ligacao: "📞", email: "✉️", reuniao: "🤝", tarefa: "✅" };

export default function Dashboard({ contacts, deals, activities }) {
  const stats = useMemo(() => {
    const totalRevenue = deals.filter(d => d.stage === "fechado").reduce((s, d) => s + Number(d.value), 0);
    const pipeline = deals.filter(d => !["fechado","perdido"].includes(d.stage)).reduce((s, d) => s + Number(d.value) * (d.probability / 100), 0);
    const pendingActs = activities.filter(a => !a.done).length;
    const today = new Date().toISOString().split("T")[0];
    const overdueActs = activities.filter(a => !a.done && a.date < today).length;
    return { totalRevenue, pipeline, pendingActs, overdueActs };
  }, [deals, activities]);

  const stageGroups = useMemo(() => {
    const groups = {};
    deals.forEach(d => {
      if (!groups[d.stage]) groups[d.stage] = { count: 0, value: 0 };
      groups[d.stage].count++;
      groups[d.stage].value += Number(d.value);
    });
    return groups;
  }, [deals]);

  const recentActivities = [...activities]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const upcomingDeals = deals
    .filter(d => !["fechado","perdido"].includes(d.stage))
    .sort((a, b) => (a.closingDate || "").localeCompare(b.closingDate || ""))
    .slice(0, 5);

  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}><DollarSign size={22} color="#3b82f6" /></div>
          <div>
            <div className="stat-value">{fmt(stats.totalRevenue)}</div>
            <div className="stat-label">Receita Fechada</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#d1fae5" }}><TrendingUp size={22} color="#10b981" /></div>
          <div>
            <div className="stat-value">{fmt(stats.pipeline)}</div>
            <div className="stat-label">Pipeline Ponderado</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}><Users size={22} color="#8b5cf6" /></div>
          <div>
            <div className="stat-value">{contacts.length}</div>
            <div className="stat-label">Contatos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: stats.overdueActs > 0 ? "#fee2e2" : "#fef3c7" }}>
            {stats.overdueActs > 0 ? <AlertCircle size={22} color="#ef4444" /> : <Calendar size={22} color="#f59e0b" />}
          </div>
          <div>
            <div className="stat-value">{stats.pendingActs}</div>
            <div className="stat-label">Atividades Pendentes {stats.overdueActs > 0 && <span className="badge badge-danger">{stats.overdueActs} atrasadas</span>}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Funil de Vendas</h2>
          <div className="funnel">
            {["prospeccao","qualificacao","proposta","negociacao","fechado","perdido"].map(stage => {
              const g = stageGroups[stage];
              if (!g) return null;
              return (
                <div key={stage} className="funnel-row">
                  <div className="funnel-stage">
                    <span className="funnel-dot" style={{ background: stageColor[stage] }} />
                    {stageLabel[stage]}
                  </div>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{ width: `${Math.min(100, (g.value / Math.max(...Object.values(stageGroups).map(x => x.value))) * 100)}%`, background: stageColor[stage] }} />
                  </div>
                  <div className="funnel-info">
                    <span>{g.count} negócio{g.count > 1 ? "s" : ""}</span>
                    <span className="funnel-value">{fmt(g.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Atividades Recentes</h2>
          {recentActivities.length === 0 ? <p className="empty">Nenhuma atividade registrada</p> : (
            <ul className="activity-list">
              {recentActivities.map(a => {
                const contact = contacts.find(c => c.id === a.contactId);
                return (
                  <li key={a.id} className={`activity-item ${a.done ? "done" : ""}`}>
                    <span className="activity-type-icon">{activityIcon[a.type]}</span>
                    <div className="activity-info">
                      <div className="activity-desc">{a.description}</div>
                      <div className="activity-meta">{contact?.name} · {a.date}</div>
                    </div>
                    {a.done ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="#f59e0b" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Negócios em Andamento</h2>
          {upcomingDeals.length === 0 ? <p className="empty">Nenhum negócio ativo</p> : (
            <ul className="deal-list">
              {upcomingDeals.map(d => {
                const contact = contacts.find(c => c.id === d.contactId);
                return (
                  <li key={d.id} className="deal-item">
                    <div className="deal-info">
                      <div className="deal-title">{d.title}</div>
                      <div className="deal-meta">{contact?.name} · Fechamento: {d.closingDate || "—"}</div>
                    </div>
                    <div className="deal-right">
                      <div className="deal-value">{fmt(d.value)}</div>
                      <span className="badge" style={{ background: stageColor[d.stage] + "22", color: stageColor[d.stage] }}>{stageLabel[d.stage]}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
