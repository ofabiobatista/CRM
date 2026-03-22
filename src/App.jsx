import { useState, useCallback } from "react";
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
  { key: "contacts", label: "Contatos", icon: Users },
  { key: "deals", label: "Negócios", icon: TrendingUp },
  { key: "activities", label: "Atividades", icon: Calendar },
  { key: "atendimento", label: "Atendimento", icon: Headphones },
  { key: "leads", label: "Leads", icon: Inbox },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [contacts, setContacts] = useState(store.getContacts());
  const [deals, setDeals] = useState(store.getDeals());
  const [activities, setActivities] = useState(store.getActivities());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlers = {
    addContact: useCallback((d) => setContacts(store.addContact(d)), []),
    updateContact: useCallback((id, d) => setContacts(store.updateContact(id, d)), []),
    deleteContact: useCallback((id) => { store.deleteContact(id); setContacts(store.getContacts()); setDeals(store.getDeals()); setActivities(store.getActivities()); }, []),
    addDeal: useCallback((d) => setDeals(store.addDeal(d)), []),
    updateDeal: useCallback((id, d) => setDeals(store.updateDeal(id, d)), []),
    deleteDeal: useCallback((id) => { store.deleteDeal(id); setDeals(store.getDeals()); }, []),
    addActivity: useCallback((d) => setActivities(store.addActivity(d)), []),
    updateActivity: useCallback((id, d) => setActivities(store.updateActivity(id, d)), []),
    deleteActivity: useCallback((id) => { store.deleteActivity(id); setActivities(store.getActivities()); }, []),
  };

  const pendingActs = activities.filter(a => !a.done).length;
  const unreadLeads = (() => { try { return JSON.parse(localStorage.getItem("crm_leads") || "[]").filter(l => !l.lido).length; } catch { return 0; } })();

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
          {nav.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => navigate(key)}>
              <Icon size={18} />
              <span>{label}</span>
              {key === "activities" && pendingActs > 0 && <span className="nav-badge">{pendingActs}</span>}
              {key === "leads" && unreadLeads > 0 && <span className="nav-badge">{unreadLeads}</span>}
            </button>
          ))}
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
          {page === "dashboard" && <Dashboard contacts={contacts} deals={deals} activities={activities} />}
          {page === "contacts" && <Contacts contacts={contacts} onAdd={handlers.addContact} onUpdate={handlers.updateContact} onDelete={handlers.deleteContact} />}
          {page === "deals" && <Deals deals={deals} contacts={contacts} onAdd={handlers.addDeal} onUpdate={handlers.updateDeal} onDelete={handlers.deleteDeal} />}
          {page === "activities" && <Activities activities={activities} contacts={contacts} deals={deals} onAdd={handlers.addActivity} onUpdate={handlers.updateActivity} onDelete={handlers.deleteActivity} />}
          {page === "atendimento" && <Atendimento contacts={contacts} />}
          {page === "leads" && <Leads onAddContact={handlers.addContact} />}
        </main>
      </div>
    </div>
  );
}
