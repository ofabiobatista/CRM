import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, GripVertical } from "lucide-react";

const stages = [
  { key: "prospeccao", label: "Prospecção", color: "#6366f1" },
  { key: "qualificacao", label: "Qualificação", color: "#8b5cf6" },
  { key: "proposta", label: "Proposta", color: "#f59e0b" },
  { key: "negociacao", label: "Negociação", color: "#3b82f6" },
  { key: "fechado", label: "Fechado", color: "#10b981" },
  { key: "perdido", label: "Perdido", color: "#ef4444" },
];

const emptyForm = { title: "", contactId: "", value: "", stage: "prospeccao", probability: 50, closingDate: "", notes: "" };

export default function Deals({ deals, contacts, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [view, setView] = useState("kanban"); // kanban | list

  function openAdd(stage = "prospeccao") { setForm({ ...emptyForm, stage }); setModal("add"); }
  function openEdit(d) { setForm({ ...d, contactId: String(d.contactId) }); setModal(d); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, value: Number(form.value), probability: Number(form.probability), contactId: Number(form.contactId) };
    if (modal === "add") onAdd(data); else onUpdate(modal.id, data);
    setModal(null);
  }

  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const DealCard = ({ deal }) => {
    const contact = contacts.find(c => c.id === deal.contactId);
    const stage = stages.find(s => s.key === deal.stage);
    return (
      <div className="deal-card">
        <div className="deal-card-header">
          <span className="deal-card-title">{deal.title}</span>
          <div className="row-actions">
            <button className="icon-btn" onClick={() => openEdit(deal)}><Edit2 size={13} /></button>
            <button className="icon-btn danger" onClick={() => setConfirmDelete(deal)}><Trash2 size={13} /></button>
          </div>
        </div>
        <div className="deal-card-value">{fmt(deal.value)}</div>
        {contact && <div className="deal-card-contact">👤 {contact.name}</div>}
        <div className="deal-card-footer">
          <span className="deal-probability">{deal.probability}%</span>
          {deal.closingDate && <span className="deal-date">📅 {deal.closingDate}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Negócios</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`pill ${view === "kanban" ? "active" : ""}`} onClick={() => setView("kanban")}>Kanban</button>
            <button className={`pill ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>Lista</button>
          </div>
          <button className="btn btn-primary" onClick={() => openAdd()}><Plus size={16} /> Novo Negócio</button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="kanban">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            const total = stageDeals.reduce((s, d) => s + Number(d.value), 0);
            return (
              <div key={stage.key} className="kanban-col">
                <div className="kanban-col-header" style={{ borderTopColor: stage.color }}>
                  <span className="kanban-col-title">{stage.label}</span>
                  <div className="kanban-col-meta">
                    <span className="kanban-count">{stageDeals.length}</span>
                    <span className="kanban-total">{fmt(total)}</span>
                  </div>
                </div>
                <div className="kanban-cards">
                  {stageDeals.map(d => <DealCard key={d.id} deal={d} />)}
                  <button className="kanban-add" onClick={() => openAdd(stage.key)}><Plus size={14} /> Adicionar</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Negócio</th><th>Contato</th><th>Valor</th><th>Estágio</th><th>Prob.</th><th>Fechamento</th><th></th></tr>
            </thead>
            <tbody>
              {deals.length === 0 && <tr><td colSpan={7} className="empty-row">Nenhum negócio cadastrado</td></tr>}
              {deals.map(d => {
                const contact = contacts.find(c => c.id === d.contactId);
                const stage = stages.find(s => s.key === d.stage);
                return (
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong></td>
                    <td>{contact?.name || "—"}</td>
                    <td>{fmt(d.value)}</td>
                    <td><span className="badge" style={{ background: stage?.color + "22", color: stage?.color }}>{stage?.label}</span></td>
                    <td>{d.probability}%</td>
                    <td>{d.closingDate || "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(d)}><Edit2 size={15} /></button>
                        <button className="icon-btn danger" onClick={() => setConfirmDelete(d)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Novo Negócio" : "Editar Negócio"}</h2>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <label>Título *<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
                <label>Contato
                  <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                    <option value="">Selecione...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>Valor (R$) *<input required type="number" min="0" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></label>
                <label>Estágio
                  <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                    {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>Probabilidade (%)
                  <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} />
                </label>
                <label>Data de Fechamento
                  <input type="date" value={form.closingDate} onChange={e => setForm({ ...form, closingDate: e.target.value })} />
                </label>
              </div>
              <label>Notas
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
            <p>Deseja excluir o negócio <strong>{confirmDelete.title}</strong>?</p>
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
