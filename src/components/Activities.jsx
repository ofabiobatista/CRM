import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, CheckCircle2, Circle } from "lucide-react";

const typeOptions = [
  { key: "ligacao", label: "Ligação", icon: "📞" },
  { key: "email", label: "Email", icon: "✉️" },
  { key: "reuniao", label: "Reunião", icon: "🤝" },
  { key: "tarefa", label: "Tarefa", icon: "✅" },
];

const emptyForm = { type: "tarefa", contactId: "", dealId: "", description: "", date: new Date().toISOString().split("T")[0], done: false };

export default function Activities({ activities, contacts, deals, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState("");
  const [filterDone, setFilterDone] = useState("all"); // all | pending | done
  const [confirmDelete, setConfirmDelete] = useState(null);

  function openAdd() { setForm(emptyForm); setModal("add"); }
  function openEdit(a) { setForm({ ...a, contactId: String(a.contactId || ""), dealId: String(a.dealId || "") }); setModal(a); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, contactId: form.contactId ? Number(form.contactId) : null, dealId: form.dealId ? Number(form.dealId) : null };
    if (modal === "add") onAdd(data); else onUpdate(modal.id, data);
    setModal(null);
  }

  function toggleDone(a) { onUpdate(a.id, { done: !a.done }); }

  const today = new Date().toISOString().split("T")[0];

  const filtered = [...activities]
    .filter(a => {
      const matchType = !filterType || a.type === filterType;
      const matchDone = filterDone === "all" || (filterDone === "pending" && !a.done) || (filterDone === "done" && a.done);
      return matchType && matchDone;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const grouped = filtered.reduce((acc, a) => {
    const label = a.date < today ? "Atrasadas" : a.date === today ? "Hoje" : a.date;
    if (!acc[label]) acc[label] = [];
    acc[label].push(a);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Atividades</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Nova Atividade</button>
      </div>

      <div className="filters">
        <div className="filter-pills">
          <button className={`pill ${!filterType ? "active" : ""}`} onClick={() => setFilterType("")}>Todos os Tipos</button>
          {typeOptions.map(t => (
            <button key={t.key} className={`pill ${filterType === t.key ? "active" : ""}`} onClick={() => setFilterType(filterType === t.key ? "" : t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="filter-pills">
          {["all","pending","done"].map(v => (
            <button key={v} className={`pill ${filterDone === v ? "active" : ""}`} onClick={() => setFilterDone(v)}>
              {v === "all" ? "Todas" : v === "pending" ? "Pendentes" : "Concluídas"}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-groups">
        {Object.keys(grouped).length === 0 && <p className="empty">Nenhuma atividade encontrada</p>}
        {Object.entries(grouped).map(([label, acts]) => (
          <div key={label} className="activity-group">
            <div className={`activity-group-label ${label === "Atrasadas" ? "overdue" : label === "Hoje" ? "today" : ""}`}>
              {label === "Atrasadas" && "⚠️ "}{label === "Hoje" && "📌 "}{label}
            </div>
            {acts.map(a => {
              const contact = contacts.find(c => c.id === a.contactId);
              const deal = deals.find(d => d.id === a.dealId);
              const typeInfo = typeOptions.find(t => t.key === a.type);
              return (
                <div key={a.id} className={`activity-row ${a.done ? "done" : ""}`}>
                  <button className="check-btn" onClick={() => toggleDone(a)}>
                    {a.done ? <CheckCircle2 size={20} color="#10b981" /> : <Circle size={20} color="#d1d5db" />}
                  </button>
                  <span className="activity-type-icon">{typeInfo?.icon}</span>
                  <div className="activity-info">
                    <div className="activity-desc">{a.description}</div>
                    <div className="activity-meta">
                      {contact && <span>👤 {contact.name}</span>}
                      {deal && <span>💼 {deal.title}</span>}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(a)}><Edit2 size={15} /></button>
                    <button className="icon-btn danger" onClick={() => setConfirmDelete(a)}><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Nova Atividade" : "Editar Atividade"}</h2>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <label>Tipo
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {typeOptions.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                  </select>
                </label>
                <label>Data *<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
              </div>
              <label>Descrição *
                <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva a atividade..." />
              </label>
              <div className="form-row">
                <label>Contato
                  <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                    <option value="">Nenhum</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>Negócio
                  <select value={form.dealId} onChange={e => setForm({ ...form, dealId: e.target.value })}>
                    <option value="">Nenhum</option>
                    {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </label>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.done} onChange={e => setForm({ ...form, done: e.target.checked })} />
                Marcar como concluída
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
            <p>Deseja excluir a atividade <strong>{confirmDelete.description}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
