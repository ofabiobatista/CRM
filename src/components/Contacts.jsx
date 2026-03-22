import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";

const statusOptions = ["lead", "prospect", "cliente", "inativo"];
const statusColor = { lead: "#6366f1", prospect: "#f59e0b", cliente: "#10b981", inativo: "#9ca3af" };

const emptyForm = { name: "", email: "", phone: "", company: "", status: "lead", tags: "" };

export default function Contacts({ contacts, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | contact object
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function openAdd() { setForm(emptyForm); setModal("add"); }
  function openEdit(c) { setForm({ ...c, tags: (c.tags || []).join(", ") }); setModal(c); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
    if (modal === "add") { onAdd(data); }
    else { onUpdate(modal.id, data); }
    setModal(null);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contatos</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Novo Contato</button>
      </div>

      <div className="filters">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Buscar por nome, email ou empresa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          <button className={`pill ${!filterStatus ? "active" : ""}`} onClick={() => setFilterStatus("")}>Todos</button>
          {statusOptions.map(s => (
            <button key={s} className={`pill ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th><th>Email</th><th>Telefone</th><th>Empresa</th><th>Status</th><th>Tags</th><th>Criado em</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-row">Nenhum contato encontrado</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id}>
                <td><div className="contact-name">{c.name}</div></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.company}</td>
                <td><span className="badge" style={{ background: statusColor[c.status] + "22", color: statusColor[c.status] }}>{c.status}</span></td>
                <td>{(c.tags || []).map(t => <span key={t} className="tag">{t}</span>)}</td>
                <td>{c.createdAt}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)}><Edit2 size={15} /></button>
                    <button className="icon-btn danger" onClick={() => setConfirmDelete(c)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Novo Contato" : "Editar Contato"}</h2>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <label>Nome *<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
                <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
              </div>
              <div className="form-row">
                <label>Telefone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
                <label>Empresa<input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></label>
              </div>
              <div className="form-row">
                <label>Status
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>Tags (separadas por vírgula)<input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="vip, parceiro" /></label>
              </div>
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
            <p>Deseja excluir <strong>{confirmDelete.name}</strong>? Todos os negócios e atividades vinculados também serão removidos.</p>
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
