import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, MessageSquare, Clock, AlertCircle, User } from "lucide-react";

const columns = [
  { key: "novo", label: "Novo", color: "#6366f1", bg: "#ede9fe" },
  { key: "em_atendimento", label: "Em Atendimento", color: "#f59e0b", bg: "#fef3c7" },
  { key: "aguardando", label: "Aguardando Cliente", color: "#3b82f6", bg: "#dbeafe" },
  { key: "resolvido", label: "Resolvido", color: "#10b981", bg: "#d1fae5" },
  { key: "fechado", label: "Fechado", color: "#9ca3af", bg: "#f3f4f6" },
];

const priorities = [
  { key: "baixa", label: "Baixa", color: "#10b981" },
  { key: "media", label: "Média", color: "#f59e0b" },
  { key: "alta", label: "Alta", color: "#ef4444" },
  { key: "urgente", label: "Urgente", color: "#7c3aed" },
];

const categories = ["Suporte Técnico", "Dúvida Comercial", "Reclamação", "Financeiro", "Onboarding", "Outro"];

const defaultTickets = [
  { id: 1, title: "Erro ao acessar o painel", contactId: 1, category: "Suporte Técnico", priority: "alta", status: "em_atendimento", assignee: "Marcos", description: "Cliente relata erro 500 ao tentar acessar o dashboard principal.", createdAt: "2026-03-19", updatedAt: "2026-03-20" },
  { id: 2, title: "Dúvida sobre plano Enterprise", contactId: 2, category: "Dúvida Comercial", priority: "media", status: "novo", assignee: "", description: "Quer entender as diferenças entre os planos Pro e Enterprise.", createdAt: "2026-03-20", updatedAt: "2026-03-20" },
  { id: 3, title: "NF não chegou por email", contactId: 3, category: "Financeiro", priority: "media", status: "aguardando", assignee: "Julia", description: "Nota fiscal referente a fevereiro não foi recebida.", createdAt: "2026-03-18", updatedAt: "2026-03-21" },
  { id: 4, title: "Configuração de integração API", contactId: 1, category: "Suporte Técnico", priority: "urgente", status: "novo", assignee: "", description: "Precisa de suporte para configurar webhook de retorno.", createdAt: "2026-03-21", updatedAt: "2026-03-21" },
  { id: 5, title: "Usuário bloqueado no sistema", contactId: 2, category: "Suporte Técnico", priority: "alta", status: "resolvido", assignee: "Marcos", description: "Usuário admin perdeu acesso após mudança de senha.", createdAt: "2026-03-17", updatedAt: "2026-03-19" },
];

function loadTickets() {
  try { return JSON.parse(localStorage.getItem("crm_tickets") || "null") || defaultTickets; } catch { return defaultTickets; }
}
function saveTickets(t) { localStorage.setItem("crm_tickets", JSON.stringify(t)); }

const emptyForm = { title: "", contactId: "", category: "Suporte Técnico", priority: "media", status: "novo", assignee: "", description: "" };

export default function Atendimento({ contacts }) {
  const [tickets, setTickets] = useState(loadTickets);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detailTicket, setDetailTicket] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterPriority, setFilterPriority] = useState("");
  const [drag, setDrag] = useState(null); // { ticketId }

  function persist(updated) { setTickets(updated); saveTickets(updated); }

  function openAdd(status = "novo") { setForm({ ...emptyForm, status }); setModal("add"); }
  function openEdit(t) { setForm({ ...t, contactId: String(t.contactId || "") }); setModal(t); setDetailTicket(null); }

  function handleSubmit(e) {
    e.preventDefault();
    const now = new Date().toISOString().split("T")[0];
    const data = { ...form, contactId: form.contactId ? Number(form.contactId) : null };
    if (modal === "add") {
      persist([...tickets, { ...data, id: Date.now(), createdAt: now, updatedAt: now }]);
    } else {
      persist(tickets.map(t => t.id === modal.id ? { ...t, ...data, updatedAt: now } : t));
    }
    setModal(null);
  }

  function moveTicket(ticketId, newStatus) {
    const now = new Date().toISOString().split("T")[0];
    persist(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: now } : t));
  }

  function handleDragStart(e, ticketId) { setDrag({ ticketId }); e.dataTransfer.effectAllowed = "move"; }
  function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
  function handleDrop(e, colKey) { e.preventDefault(); if (drag) { moveTicket(drag.ticketId, colKey); setDrag(null); } }

  const filtered = filterPriority ? tickets.filter(t => t.priority === filterPriority) : tickets;
  const totalOpen = tickets.filter(t => !["resolvido","fechado"].includes(t.status)).length;
  const urgent = tickets.filter(t => t.priority === "urgente" && !["resolvido","fechado"].includes(t.status)).length;

  const PriorityBadge = ({ p }) => {
    const pr = priorities.find(x => x.key === p);
    return <span className="priority-badge" style={{ background: pr?.color + "22", color: pr?.color }}>{pr?.label}</span>;
  };

  const TicketCard = ({ ticket }) => {
    const contact = contacts.find(c => c.id === ticket.contactId);
    return (
      <div
        className="ticket-card"
        draggable
        onDragStart={e => handleDragStart(e, ticket.id)}
        onClick={() => setDetailTicket(ticket)}
      >
        <div className="ticket-card-top">
          <PriorityBadge p={ticket.priority} />
          <span className="ticket-category">{ticket.category}</span>
        </div>
        <div className="ticket-title">{ticket.title}</div>
        {ticket.description && <div className="ticket-desc">{ticket.description.slice(0, 80)}{ticket.description.length > 80 ? "…" : ""}</div>}
        <div className="ticket-card-footer">
          {contact ? <span className="ticket-contact"><User size={11} /> {contact.name}</span> : <span />}
          <div className="ticket-meta-right">
            {ticket.assignee && <span className="ticket-assignee">{ticket.assignee}</span>}
            <span className="ticket-date">{ticket.updatedAt}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page atendimento-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Atendimento</h1>
          <div className="atend-summary">
            <span>{totalOpen} abertos</span>
            {urgent > 0 && <span className="urgent-badge"><AlertCircle size={12} /> {urgent} urgente{urgent > 1 ? "s" : ""}</span>}
          </div>
        </div>
        <div className="header-actions">
          <div className="filter-pills">
            <button className={`pill ${!filterPriority ? "active" : ""}`} onClick={() => setFilterPriority("")}>Todas</button>
            {priorities.map(p => (
              <button key={p.key} className={`pill ${filterPriority === p.key ? "active" : ""}`}
                style={filterPriority === p.key ? { background: p.color, borderColor: p.color } : {}}
                onClick={() => setFilterPriority(filterPriority === p.key ? "" : p.key)}>{p.label}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openAdd()}><Plus size={16} /> Novo Ticket</button>
        </div>
      </div>

      <div className="atend-board">
        {columns.map(col => {
          const colTickets = filtered.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              className="atend-col"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.key)}
            >
              <div className="atend-col-header" style={{ borderTopColor: col.color }}>
                <div className="atend-col-title">
                  <span style={{ color: col.color }}>{col.label}</span>
                  <span className="atend-col-count" style={{ background: col.bg, color: col.color }}>{colTickets.length}</span>
                </div>
              </div>
              <div className="atend-cards">
                {colTickets.map(t => <TicketCard key={t.id} ticket={t} />)}
                <button className="kanban-add" onClick={() => openAdd(col.key)}><Plus size={14} /> Adicionar</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {detailTicket && (() => {
        const t = tickets.find(x => x.id === detailTicket.id) || detailTicket;
        const contact = contacts.find(c => c.id === t.contactId);
        const col = columns.find(c => c.key === t.status);
        return (
          <div className="modal-backdrop" onClick={() => setDetailTicket(null)}>
            <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <PriorityBadge p={t.priority} />
                    <span className="ticket-category">{t.category}</span>
                  </div>
                  <h2>{t.title}</h2>
                </div>
                <button className="icon-btn" onClick={() => setDetailTicket(null)}><X size={18} /></button>
              </div>
              <div className="detail-body">
                {t.description && <p className="detail-desc">{t.description}</p>}
                <div className="detail-grid">
                  <div className="detail-field"><span>Status</span><span className="badge" style={{ background: col?.bg, color: col?.color }}>{col?.label}</span></div>
                  <div className="detail-field"><span>Contato</span><span>{contact?.name || "—"}</span></div>
                  <div className="detail-field"><span>Responsável</span><span>{t.assignee || "—"}</span></div>
                  <div className="detail-field"><span>Criado em</span><span>{t.createdAt}</span></div>
                  <div className="detail-field"><span>Atualizado</span><span>{t.updatedAt}</span></div>
                </div>
                <div className="detail-status-actions">
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Mover para:</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {columns.filter(c => c.key !== t.status).map(c => (
                      <button key={c.key} className="pill" style={{ borderColor: c.color, color: c.color }}
                        onClick={() => { moveTicket(t.id, c.key); setDetailTicket({ ...t, status: c.key }); }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ padding: "0 24px 20px" }}>
                <button className="btn btn-secondary icon-btn-text" onClick={() => setConfirmDelete(t)}><Trash2 size={15} /> Excluir</button>
                <button className="btn btn-primary" onClick={() => openEdit(t)}><Edit2 size={15} /> Editar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add/Edit modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Novo Ticket" : "Editar Ticket"}</h2>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Título *<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Descreva o problema ou solicitação..." /></label>
              <div className="form-row">
                <label>Categoria
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>Prioridade
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {priorities.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>Status
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </label>
                <label>Contato
                  <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                    <option value="">Nenhum</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <label>Responsável<input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Nome do atendente..." /></label>
              <label>Descrição
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhes adicionais..." />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Check size={15} /> Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h2>Confirmar Exclusão</h2>
            <p>Deseja excluir o ticket <strong>{confirmDelete.title}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { persist(tickets.filter(t => t.id !== confirmDelete.id)); setConfirmDelete(null); setDetailTicket(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
