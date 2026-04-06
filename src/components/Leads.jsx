import { useState, useEffect } from "react";
import { RefreshCw, UserPlus, Trash2, Mail, Phone, Building, Tag, Eye, EyeOff } from "lucide-react";
import * as store from "../data/store";

export default function Leads({ onAddContact, onBadgeChange }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterLido, setFilterLido] = useState("todos");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await store.getLeads();
    setLeads(data);
    setLoading(false);
  }

  async function markRead(id, val) {
    await store.updateLead(id, { lido: val });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lido: val } : l));
    if (selected?.id === id) setSelected(prev => ({ ...prev, lido: val }));
    onBadgeChange?.();
  }

  async function handleDelete(id) {
    await store.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setConfirmDelete(null);
    if (selected?.id === id) setSelected(null);
    onBadgeChange?.();
  }

  async function convertToContact(lead) {
    await onAddContact({
      name: lead.nome,
      email: lead.email,
      phone: lead.telefone,
      company: lead.empresa,
      status: "lead",
      tags: [lead.servico].filter(Boolean),
    });
    await markRead(lead.id, true);
    alert(`✅ "${lead.nome}" adicionado como contato no CRM!`);
  }

  const filtered = leads.filter(l =>
    filterLido === "todos" ? true : filterLido === "nao_lidos" ? !l.lido : l.lido
  );
  const naoLidos = leads.filter(l => !l.lido).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads da Landing Page</h1>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} recebido{leads.length !== 1 ? "s" : ""}
            {naoLidos > 0 && <span className="badge badge-danger" style={{ marginLeft: 8 }}>{naoLidos} novo{naoLidos > 1 ? "s" : ""}</span>}
          </div>
        </div>
        <div className="header-actions">
          <div className="filter-pills">
            {[["todos","Todos"],["nao_lidos","Não lidos"],["lidos","Lidos"]].map(([v,l]) => (
              <button key={v} className={`pill ${filterLido === v ? "active" : ""}`} onClick={() => setFilterLido(v)}>{l}</button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Atualizar</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>Carregando leads...</div>
      ) : leads.length === 0 ? (
        <div className="leads-empty">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📥</div>
          <h3>Nenhum lead ainda</h3>
          <p>Quando alguém preencher o formulário na landing page da Candeeiro, o lead aparecerá aqui automaticamente.</p>
        </div>
      ) : (
        <div className="leads-layout">
          <div className="leads-list">
            {filtered.map(lead => (
              <div
                key={lead.id}
                className={`lead-row ${!lead.lido ? "unread" : ""} ${selected?.id === lead.id ? "selected" : ""}`}
                onClick={() => { setSelected(lead); markRead(lead.id, true); }}
              >
                <div className="lead-avatar">{lead.nome?.charAt(0).toUpperCase()}</div>
                <div className="lead-info">
                  <div className="lead-name">
                    {!lead.lido && <span className="unread-dot" />}
                    {lead.nome}
                  </div>
                  <div className="lead-sub">{lead.empresa || lead.email}</div>
                </div>
                <div className="lead-right">
                  {lead.servico && <span className="tag">{lead.servico}</span>}
                  <span className="lead-date">{lead.data}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="empty" style={{ padding: "32px 0" }}>Nenhum lead nessa categoria</p>}
          </div>

          {selected && (
            <div className="lead-detail">
              <div className="lead-detail-header">
                <div className="lead-avatar lead-avatar-lg">{selected.nome?.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 className="lead-detail-name">{selected.nome}</h2>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected.origem} · {selected.data}</div>
                </div>
              </div>
              <div className="lead-detail-fields">
                {selected.email && <div className="lead-field"><Mail size={14} /><a href={`mailto:${selected.email}`}>{selected.email}</a></div>}
                {selected.telefone && <div className="lead-field"><Phone size={14} /><a href={`tel:${selected.telefone}`}>{selected.telefone}</a></div>}
                {selected.empresa && <div className="lead-field"><Building size={14} />{selected.empresa}</div>}
                {selected.servico && <div className="lead-field"><Tag size={14} />{selected.servico}</div>}
              </div>
              {selected.mensagem && (
                <div className="lead-message">
                  <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Mensagem</div>
                  <p>{selected.mensagem}</p>
                </div>
              )}
              <div className="lead-actions">
                <button className="btn btn-secondary" onClick={() => markRead(selected.id, !selected.lido)}>
                  {selected.lido ? <><EyeOff size={14} /> Marcar não lido</> : <><Eye size={14} /> Marcar como lido</>}
                </button>
                <button className="btn btn-secondary" style={{ color: "#ef4444", borderColor: "#fee2e2" }} onClick={() => setConfirmDelete(selected)}>
                  <Trash2 size={14} /> Excluir
                </button>
                <button className="btn btn-primary" onClick={() => convertToContact(selected)}>
                  <UserPlus size={14} /> Adicionar como Contato
                </button>
              </div>
            </div>
          )}

          {!selected && filtered.length > 0 && (
            <div className="lead-detail lead-detail-empty">
              <div style={{ fontSize: 32 }}>👆</div>
              <p>Selecione um lead para ver os detalhes</p>
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h2>Confirmar Exclusão</h2>
            <p>Deseja excluir o lead de <strong>{confirmDelete.nome}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
