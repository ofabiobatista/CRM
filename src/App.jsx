import { useState, useEffect } from "react";
import { LayoutDashboard, Users, TrendingUp, Calendar, Headphones, Inbox, Menu, X } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Contacts from "./components/Contacts";
import Deals from "./components/Deals";
import Activities from "./components/Activities";
import Atendimento from "./components/Atendimento";
import Leads from "./components/Leads";
import * as store from "./data/store";
import "./App.css";

const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "deals", label: "Pipeline", icon: TrendingUp },
  { key: "contacts", label: "Contatos", icon: Users },
  { divider: true, label: "Gerenciadores" },
  { key: "meta", label: "Meta Ads", icon: null, external: "https://business.facebook.com" },
  { key: "google", label: "Google Ads", icon: null, external: "https://ads.google.com" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadLeads, setUnreadLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, d, a] = await Promise.all([store.getContacts(), store.getDeals(), store.getActivities()]);
        setContacts(c);
        setDeals(d);
        setActivities(a);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    refreshLeadBadge();
  }, []);

  async function refreshLeadBadge() {
    const leads = await store.getLeads();
    setUnreadLeads(leads.filter(l => !l.lido).length);
  }

  const handlers = {
    addContact: async (data) => {
      const c = await store.addContact(data);
      setContacts(prev => [c, ...prev]);
    },
    updateContact: async (id, data) => {
      await store.updateContact(id, data);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    },
    deleteContact: async (id) => {
      await store.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      setDeals(prev => prev.filter(d => d.contactId !== id));
      setActivities(prev => prev.filter(a => a.contactId !== id));
    },
    addDeal: async (data) => {
      const d = await store.addDeal(data);
      setDeals(prev => [d, ...prev]);
    },
    updateDeal: async (id, data) => {
      await store.updateDeal(id, data);
      setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    },
    deleteDeal: async (id) => {
      await store.deleteDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
    },
    addActivity: async (data) => {
      const a = await store.addActivity(data);
      setActivities(prev => [a, ...prev]);
    },
    updateActivity: async (id, data) => {
      await store.updateActivity(id, data);
      setActivities(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    },
    deleteActivity: async (id) => {
      await store.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    },
  };

  const pendingActs = activities.filter(a => !a.done).length;

  function navigate(key) { setPage(key); setSidebarOpen(false); }

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">💼</span>
          <span className="logo-text">MeuCRM</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item, i) => {
            if (item.divider) return (
              <div key={i} className="nav-divider">
                <span>{item.label}</span>
              </div>
            );
            const { key, label, icon: Icon, external } = item;
            if (external) return (
              <a key={key} href={external} target="_blank" rel="noreferrer" className="nav-item nav-external">
                <span className={`nav-ext-icon nav-ext-${key}`} />
                <span>{label}</span>
                <svg className="nav-ext-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </a>
            );
            return (
              <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => navigate(key)}>
                <Icon size={18} />
                <span>{label}</span>
                {key === "activities" && pendingActs > 0 && <span className="nav-badge">{pendingActs}</span>}
                {key === "leads" && unreadLeads > 0 && <span className="nav-badge">{unreadLeads}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div><span>{contacts.length}</span> contatos</div>
            <div><span>{deals.length}</span> negócios</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-title">{nav.find(n => n.key === page)?.label}</div>
        </header>

        <main className="content">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12, color: "#6b7280" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>Carregando...</span>
            </div>
          ) : (
            <>
              {page === "dashboard" && <Dashboard contacts={contacts} deals={deals} activities={activities} />}
              {page === "contacts" && <Contacts contacts={contacts} onAdd={handlers.addContact} onUpdate={handlers.updateContact} onDelete={handlers.deleteContact} />}
              {page === "deals" && <Deals deals={deals} contacts={contacts} onAdd={handlers.addDeal} onUpdate={handlers.updateDeal} onDelete={handlers.deleteDeal} />}
              {page === "activities" && <Activities activities={activities} contacts={contacts} deals={deals} onAdd={handlers.addActivity} onUpdate={handlers.updateActivity} onDelete={handlers.deleteActivity} />}
              {page === "atendimento" && <Atendimento contacts={contacts} />}
              {page === "leads" && <Leads onAddContact={handlers.addContact} onBadgeChange={refreshLeadBadge} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
