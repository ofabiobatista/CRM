import { useState, useEffect } from "react";
import { Plus, Search, ExternalLink, Copy, Trash2, FileText, Send, Check, X, Eye } from "lucide-react";
import * as store from "../data/store";

// ===== AGÊNCIA =====
const AGENCY = {
  name:       "Candeeiro Mídias",
  whatsapp:   "5511999999999",
  email:      "contato@candeeiromidias.com.br",
  website:    "candeeiromidias.com.br",
  baseDomain: "https://propostas.candeeiromidias.com.br",
  gh: {
    owner:  "ofabiobatista",
    repo:   "propostas-agencia",
    branch: "main",
    token:  process.env.VITE_GH_TOKEN || "",
  },
};

const TEMPLATE_URL = `https://raw.githubusercontent.com/${AGENCY.gh.owner}/${AGENCY.gh.repo}/${AGENCY.gh.branch}/template.html`;

const STATUS = {
  rascunho: { label: "Rascunho", color: "#9ca3af", bg: "#f3f4f6" },
  enviada:  { label: "Enviada",  color: "#d97706", bg: "#fef3c7" },
  aceita:   { label: "Aceita",   color: "#059669", bg: "#d1fae5" },
  recusada: { label: "Recusada", color: "#dc2626", bg: "#fee2e2" },
};

const PLATFORMS  = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads"];
const OBJECTIVES = ["Geração de Leads", "Vendas Online", "Branding e Awareness", "Tráfego para Loja Física"];
const PERIODS    = ["3 meses", "6 meses", "12 meses"];
const SERVICES   = [
  "Gestão de Tráfego Pago",
  "Criação de Criativos",
  "Relatórios Semanais",
  "Instalação de Pixel",
  "Configuração de Conversões",
  "Copy de Anúncios",
];

const SVC_ICONS = {
  "Gestão de Tráfego Pago":    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  "Criação de Criativos":      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  "Relatórios Semanais":       `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  "Instalação de Pixel":       `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  "Configuração de Conversões":`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  "Copy de Anúncios":          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

// ===== UTILITIES =====
const slugify = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const brl = n => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const todayStr = () => new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function getResults(niche, budget) {
  const map = {
    saude:       { cpl: "R$ 18–45",  cpa: "R$ 80–200",  roas: "4–8x"  },
    estetica:    { cpl: "R$ 18–45",  cpa: "R$ 80–200",  roas: "4–8x"  },
    clinica:     { cpl: "R$ 18–45",  cpa: "R$ 80–200",  roas: "4–8x"  },
    educacao:    { cpl: "R$ 12–35",  cpa: "R$ 60–150",  roas: "5–10x" },
    imobiliario: { cpl: "R$ 30–90",  cpa: "R$ 200–600", roas: "3–6x"  },
    imovel:      { cpl: "R$ 30–90",  cpa: "R$ 200–600", roas: "3–6x"  },
    ecommerce:   { cpl: "R$ 5–20",   cpa: "R$ 40–100",  roas: "3–8x"  },
    loja:        { cpl: "R$ 5–20",   cpa: "R$ 40–100",  roas: "3–8x"  },
  };
  const key = Object.keys(map).find(k => (niche || "").toLowerCase().includes(k)) || null;
  const d = key ? map[key] : { cpl: "R$ 15–50", cpa: "R$ 80–250", roas: "3–7x" };
  const minL = Math.max(1, Math.floor(budget / 80));
  const maxL = Math.max(minL + 1, Math.floor(budget / 20));
  return { leads: `${minL}–${maxL} leads/mês`, ...d };
}

function svcsHTML(list) {
  return list.map(s => `
    <div class="service-card" data-reveal>
      <div class="service-icon">${SVC_ICONS[s] || SVC_ICONS["Gestão de Tráfego Pago"]}</div>
      <h3>${s}</h3>
    </div>`).join("\n");
}

async function fetchTemplate() {
  const r = await fetch(TEMPLATE_URL);
  if (!r.ok) throw new Error("Não foi possível carregar o template da proposta.");
  return r.text();
}

function applyTemplate(tmpl, data, results) {
  return tmpl
    .replace(/\{\{CLIENT_NAME\}\}/g,       data.client_name)
    .replace(/\{\{COMPANY\}\}/g,           data.company)
    .replace(/\{\{NICHE\}\}/g,             data.niche || "")
    .replace(/\{\{CITY\}\}/g,              data.city || "Brasil")
    .replace(/\{\{PLATFORMS\}\}/g,         data.platforms || "")
    .replace(/\{\{OBJECTIVE\}\}/g,         data.objective || "")
    .replace(/\{\{MEDIA_BUDGET\}\}/g,      brl(data.mediaBudget))
    .replace(/\{\{AGENCY_FEE\}\}/g,        brl(data.agencyFee))
    .replace(/\{\{TOTAL\}\}/g,             brl(data.total))
    .replace(/\{\{TOTAL_CONTRACT\}\}/g,    brl(data.totalContract))
    .replace(/\{\{CONTRACT_PERIOD\}\}/g,   data.contractPeriod || "")
    .replace(/\{\{CONTRACT_MONTHS\}\}/g,   String(data.contractMonths || 0))
    .replace(/\{\{SERVICES_LIST\}\}/g,     (data.services || []).join(", "))
    .replace(/\{\{SERVICES_HTML\}\}/g,     svcsHTML(data.services || []))
    .replace(/\{\{GENERATED_DATE\}\}/g,    todayStr())
    .replace(/\{\{SLUG\}\}/g,             data.slug)
    .replace(/\{\{EXPECTED_LEADS\}\}/g,    results.leads)
    .replace(/\{\{EXPECTED_CPL\}\}/g,      results.cpl)
    .replace(/\{\{EXPECTED_ROAS\}\}/g,     results.roas)
    .replace(/\{\{EXPECTED_CPA\}\}/g,      results.cpa)
    .replace(/\{\{AGENCY_NAME\}\}/g,       AGENCY.name)
    .replace(/\{\{AGENCY_NAME_INITIAL\}\}/g, AGENCY.name.charAt(0))
    .replace(/\{\{AGENCY_WHATSAPP\}\}/g,   AGENCY.whatsapp)
    .replace(/\{\{AGENCY_EMAIL\}\}/g,      AGENCY.email)
    .replace(/\{\{AGENCY_WEBSITE\}\}/g,    AGENCY.website)
    .replace(/\{\{BASE_DOMAIN\}\}/g,       AGENCY.baseDomain);
}

async function commitToGitHub(slug, html) {
  const { owner, repo, branch, token } = AGENCY.gh;
  const path    = `proposals/${slug}.html`;
  const apiUrl  = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept:        "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
  let sha;
  try {
    const check = await fetch(apiUrl, { headers });
    if (check.ok) sha = (await check.json()).sha;
  } catch (_) {}

  const bytes = new TextEncoder().encode(html);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    bin += String.fromCharCode(...bytes.subarray(i, Math.min(i + 8192, bytes.length)));
  }
  const content = btoa(bin);
  const body = { message: `✨ Proposta: ${slug} — ${todayStr()}`, content, branch };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API: ${res.status}`);
  }
}

// ===== FORM PADRÃO =====
const emptyForm = {
  contactId:      "",
  client_name:    "",
  company:        "",
  niche:          "",
  city:           "",
  slug:           "",
  platforms:      ["Meta Ads"],
  objective:      OBJECTIVES[0],
  mediaBudget:    3000,
  agencyFee:      1500,
  contractPeriod: "6 meses",
  services:       ["Gestão de Tráfego Pago"],
};

// ===== COMPONENT =====
export default function Proposals({ contacts }) {
  const [proposals, setProposals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("");
  const [modal, setModal]           = useState(null); // null | "new" | proposal obj
  const [form, setForm]             = useState(emptyForm);
  const [publishing, setPublishing] = useState(false); // false | "generating" | "committing" | "done" | "error"
  const [pubError, setPubError]     = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await store.getProposals();
      setProposals(data);
    } finally {
      setLoading(false);
    }
  }

  // ── toast helper ──
  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── form helpers ──
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  function togglePlatform(p) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter(x => x !== p)
        : [...f.platforms, p],
    }));
  }

  function toggleService(s) {
    setForm(f => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter(x => x !== s)
        : [...f.services, s],
    }));
  }

  function pickContact(id) {
    const c = contacts.find(c => c.id === id);
    if (!c) { set("contactId", ""); return; }
    const slug = slugify(c.company || c.name);
    setForm(f => ({
      ...f,
      contactId:   c.id,
      client_name: c.name,
      company:     c.company || "",
      city:        "",
      slug,
    }));
  }

  function handleCompanyChange(val) {
    setForm(f => ({ ...f, company: val, slug: slugify(val) }));
  }

  const total = (form.mediaBudget || 0) + (form.agencyFee || 0);
  const months = parseInt(form.contractPeriod) || 6;
  const totalContract = total * months;

  function buildProposalData() {
    if (!form.client_name.trim()) { showToast("Preencha o nome do contato.", "err"); return null; }
    if (!form.company.trim())     { showToast("Preencha o nome da empresa.", "err"); return null; }
    if (!form.slug.trim())        { showToast("Defina o slug da URL.", "err"); return null; }
    if (!form.platforms.length)   { showToast("Selecione ao menos uma plataforma.", "err"); return null; }
    if (!form.services.length)    { showToast("Selecione ao menos um serviço.", "err"); return null; }
    const safeSlug = slugify(form.slug);
    if (!safeSlug)                { showToast("Slug inválido.", "err"); return null; }
    const results = getResults(form.niche, form.mediaBudget || 0);
    return {
      contactId:      form.contactId || null,
      client_name:    form.client_name.trim(),
      company:        form.company.trim(),
      niche:          form.niche.trim(),
      city:           form.city.trim(),
      slug:           safeSlug,
      platforms:      form.platforms.join(" + "),
      objective:      form.objective,
      mediaBudget:    form.mediaBudget || 0,
      agencyFee:      form.agencyFee || 0,
      total,
      totalContract,
      contractPeriod: form.contractPeriod,
      contractMonths: months,
      services:       form.services,
      expectedLeads:  results.leads,
      expectedCpl:    results.cpl,
      expectedRoas:   results.roas,
      expectedCpa:    results.cpa,
    };
  }

  // ── Preview ──
  async function doPreview() {
    const data = buildProposalData();
    if (!data) return;
    try {
      const tmpl    = await fetchTemplate();
      const results = { leads: data.expectedLeads, cpl: data.expectedCpl, roas: data.expectedRoas, cpa: data.expectedCpa };
      setPreviewHtml(applyTemplate(tmpl, data, results));
      setShowPreview(true);
    } catch (e) {
      showToast("Erro ao gerar preview: " + e.message, "err");
    }
  }

  // ── Salvar rascunho ──
  async function saveDraft() {
    const data = buildProposalData();
    if (!data) return;
    try {
      if (modal && modal !== "new") {
        await store.updateProposal(modal.id, { ...data, status: modal.status });
        setProposals(prev => prev.map(p => p.id === modal.id ? { ...p, ...data, status: modal.status } : p));
        showToast("Proposta atualizada!", "ok");
      } else {
        const saved = await store.addProposal({ ...data, status: "rascunho" });
        setProposals(prev => [saved, ...prev]);
        showToast("Rascunho salvo!", "ok");
      }
      setModal(null);
    } catch (e) {
      showToast("Erro ao salvar: " + e.message, "err");
    }
  }

  // ── Publicar ──
  async function doPublish() {
    const data = buildProposalData();
    if (!data) return;
    setPublishing("generating");
    setPubError("");
    try {
      const tmpl    = await fetchTemplate();
      const results = { leads: data.expectedLeads, cpl: data.expectedCpl, roas: data.expectedRoas, cpa: data.expectedCpa };
      const html    = applyTemplate(tmpl, data, results);

      setPublishing("committing");
      await commitToGitHub(data.slug, html);

      const url = `${AGENCY.baseDomain}/${data.slug}`;
      setPublishing("done");

      if (modal && modal !== "new") {
        await store.updateProposal(modal.id, { ...data, status: "enviada", url, sentAt: new Date().toISOString() });
        setProposals(prev => prev.map(p => p.id === modal.id ? { ...p, ...data, status: "enviada", url } : p));
      } else {
        const saved = await store.addProposal({ ...data, status: "enviada", url, sentAt: new Date().toISOString() });
        setProposals(prev => [saved, ...prev]);
      }
    } catch (e) {
      setPublishing("error");
      setPubError(e.message);
    }
  }

  // ── Status update inline ──
  async function changeStatus(id, status) {
    await store.updateProposal(id, { status });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  // ── Delete ──
  async function doDelete(id) {
    await store.deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
    setConfirmDel(null);
    showToast("Proposta removida.", "ok");
  }

  // ── Open form ──
  function openNew() {
    setForm(emptyForm);
    setPublishing(false);
    setPubError("");
    setModal("new");
  }

  function openEdit(p) {
    const plats = (p.platforms || "").split(" + ").filter(Boolean);
    setForm({
      contactId:      p.contactId || "",
      client_name:    p.client_name,
      company:        p.company,
      niche:          p.niche || "",
      city:           p.city || "",
      slug:           p.slug,
      platforms:      plats.length ? plats : ["Meta Ads"],
      objective:      p.objective || OBJECTIVES[0],
      mediaBudget:    p.mediaBudget || 0,
      agencyFee:      p.agencyFee || 0,
      contractPeriod: p.contractPeriod || "6 meses",
      services:       Array.isArray(p.services) ? p.services : [],
    });
    setPublishing(false);
    setPubError("");
    setModal(p);
  }

  // ── Filtered list ──
  const filtered = proposals.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.company?.toLowerCase().includes(q) || p.client_name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    const matchS = !filterStatus || p.status === filterStatus;
    return matchQ && matchS;
  });

  const isEditing = modal && modal !== "new";

  return (
    <div className="page">
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1e1e2e", color: toast.type === "err" ? "#f87171" : "#34d399",
          padding: "10px 22px", borderRadius: 100, fontSize: 13, fontWeight: 500,
          zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap",
        }}>{toast.msg}</div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">Propostas</h1>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova Proposta
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="filters">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Buscar por empresa, contato ou slug..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          <button className={`pill ${!filterStatus ? "active" : ""}`} onClick={() => setFilter("")}>Todas</button>
          {Object.entries(STATUS).map(([k, v]) => (
            <button key={k} className={`pill ${filterStatus === k ? "active" : ""}`} onClick={() => setFilter(filterStatus === k ? "" : k)}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        {loading ? (
          <div className="empty-row" style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Plataformas</th>
                <th>Total/mês</th>
                <th>Status</th>
                <th>Criada em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">Nenhuma proposta encontrada.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.company}</td>
                  <td style={{ color: "#6b7280" }}>{p.client_name}</td>
                  <td style={{ fontSize: 12, color: "#6b7280" }}>{p.platforms}</td>
                  <td style={{ fontWeight: 600 }}>{brl(p.total)}</td>
                  <td>
                    <select
                      value={p.status}
                      onChange={e => changeStatus(p.id, e.target.value)}
                      style={{
                        background: STATUS[p.status]?.bg || "#f3f4f6",
                        color: STATUS[p.status]?.color || "#6b7280",
                        border: "none", borderRadius: 20, padding: "3px 10px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: 12, color: "#9ca3af" }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      {p.url && (
                        <button className="icon-btn" title="Abrir proposta" onClick={() => window.open(p.url, "_blank")}>
                          <ExternalLink size={14} />
                        </button>
                      )}
                      {p.url && (
                        <button className="icon-btn" title="Copiar link" onClick={() => { navigator.clipboard.writeText(p.url); showToast("Link copiado!", "ok"); }}>
                          <Copy size={14} />
                        </button>
                      )}
                      <button className="icon-btn" title="Editar" onClick={() => openEdit(p)}>
                        <FileText size={14} />
                      </button>
                      <button className="icon-btn danger" title="Excluir" onClick={() => setConfirmDel(p)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ══════════════════════════════
          MODAL — FORM
      ══════════════════════════════ */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && publishing !== "generating" && publishing !== "committing") setModal(null); }}>
          <div className="prop-modal">

            {/* Header */}
            <div className="prop-modal-head">
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                  {isEditing ? `Proposta — ${modal.company}` : "Nova Proposta"}
                </div>
                {isEditing && modal.url && (
                  <a href={modal.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#6366f1" }}>{modal.url}</a>
                )}
              </div>
              <button className="icon-btn" onClick={() => setModal(null)} disabled={publishing === "generating" || publishing === "committing"}>
                <X size={18} />
              </button>
            </div>

            <div className="prop-modal-body">

              {/* ── Publicação em andamento ── */}
              {publishing && publishing !== false && (
                <div className="pub-overlay">
                  {publishing === "generating" && <PubStep label="Gerando HTML da proposta..." active />}
                  {publishing === "committing" && (
                    <>
                      <PubStep label="Gerando HTML" done />
                      <PubStep label="Publicando no GitHub → Vercel..." active />
                    </>
                  )}
                  {publishing === "done" && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Proposta publicada!</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>O Vercel está fazendo o deploy (~30s).</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                        <a href={`${AGENCY.baseDomain}/${form.slug}`} target="_blank" rel="noreferrer" style={{ flex: 1, color: "#6366f1", fontSize: 13, wordBreak: "break-all" }}>
                          {AGENCY.baseDomain}/{slugify(form.slug)}
                        </a>
                        <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(`${AGENCY.baseDomain}/${slugify(form.slug)}`); showToast("Link copiado!", "ok"); }}>
                          <Copy size={14} />
                        </button>
                      </div>
                      <button className="btn btn-secondary" onClick={() => { setModal(null); setPublishing(false); }}>Fechar</button>
                    </div>
                  )}
                  {publishing === "error" && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 16 }}>⚠️ {pubError}</div>
                      <button className="btn btn-secondary" onClick={() => setPublishing(false)}>Tentar novamente</button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Formulário ── */}
              {(!publishing || publishing === false) && (
                <>
                  {/* Cliente */}
                  <div className="prop-section">
                    <div className="prop-section-title">Cliente</div>
                    <div className="field-row">
                      <div className="field">
                        <label>Selecionar contato existente</label>
                        <select value={form.contactId} onChange={e => pickContact(e.target.value)}>
                          <option value="">— Preencher manualmente —</option>
                          {contacts.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Nome do contato *</label>
                        <input type="text" value={form.client_name} onChange={e => set("client_name", e.target.value)} placeholder="Ex: João Silva" />
                      </div>
                      <div className="field">
                        <label>Empresa *</label>
                        <input type="text" value={form.company} onChange={e => handleCompanyChange(e.target.value)} placeholder="Ex: Clínica Bella" />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Nicho / Segmento</label>
                        <input type="text" value={form.niche} onChange={e => set("niche", e.target.value)} placeholder="Ex: Clínica estética" />
                      </div>
                      <div className="field">
                        <label>Cidade</label>
                        <input type="text" value={form.city} onChange={e => set("city", e.target.value)} placeholder="Ex: São Paulo — SP" />
                      </div>
                    </div>
                  </div>

                  {/* Plataformas & Objetivo */}
                  <div className="prop-section">
                    <div className="prop-section-title">Plataformas e Objetivo</div>
                    <div className="field">
                      <label>Plataformas *</label>
                      <div className="prop-pills">
                        {PLATFORMS.map(p => (
                          <button key={p} type="button"
                            className={`prop-pill ${form.platforms.includes(p) ? "on" : ""}`}
                            onClick={() => togglePlatform(p)}>{p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="field" style={{ marginTop: 14 }}>
                      <label>Objetivo principal</label>
                      <select value={form.objective} onChange={e => set("objective", e.target.value)}>
                        {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Investimento */}
                  <div className="prop-section">
                    <div className="prop-section-title">Investimento Mensal</div>
                    <div className="field-row">
                      <div className="field">
                        <label>Verba de mídia (R$) *</label>
                        <input type="number" value={form.mediaBudget} min={0} step={100} onChange={e => set("mediaBudget", parseFloat(e.target.value) || 0)} />
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Pago direto ao Meta/Google</div>
                      </div>
                      <div className="field">
                        <label>Fee da agência (R$) *</label>
                        <input type="number" value={form.agencyFee} min={0} step={100} onChange={e => set("agencyFee", parseFloat(e.target.value) || 0)} />
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Taxa de gestão mensal</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", marginTop: 8 }}>
                      <span style={{ color: "#6b7280" }}>Total mensal</span>
                      <span style={{ fontWeight: 700, color: "#6366f1", fontSize: 16 }}>{brl(total)}</span>
                    </div>
                  </div>

                  {/* Contrato & Serviços */}
                  <div className="prop-section">
                    <div className="prop-section-title">Contrato e Serviços</div>
                    <div className="field">
                      <label>Prazo do contrato</label>
                      <select value={form.contractPeriod} onChange={e => set("contractPeriod", e.target.value)}>
                        {PERIODS.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Total no período: {brl(totalContract)}</div>
                    </div>
                    <div className="field" style={{ marginTop: 14 }}>
                      <label>Serviços incluídos *</label>
                      <div className="prop-pills">
                        {SERVICES.map(s => (
                          <button key={s} type="button"
                            className={`prop-pill ${form.services.includes(s) ? "on" : ""}`}
                            onClick={() => toggleService(s)}>{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="prop-section">
                    <div className="prop-section-title">URL da Proposta</div>
                    <div className="field">
                      <label>Slug *</label>
                      <input type="text" value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="clinica-bella" />
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                        {AGENCY.baseDomain}/<strong style={{ color: "#6366f1" }}>{slugify(form.slug) || "slug"}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            {(!publishing || publishing === false) && (
              <div className="prop-modal-foot">
                <button className="btn btn-secondary" onClick={doPreview} style={{ gap: 6 }}>
                  <Eye size={15} /> Preview
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary" onClick={saveDraft}>
                    <FileText size={15} /> Salvar rascunho
                  </button>
                  <button className="btn btn-primary" onClick={doPublish}>
                    <Send size={15} /> Publicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MODAL — PREVIEW
      ══════════════════════════════ */}
      {showPreview && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPreview(false); }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "95vw", height: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontWeight: 700 }}>Pré-visualização</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => { setShowPreview(false); doPublish(); }}>
                  <Send size={13} /> Publicar
                </button>
                <button className="icon-btn" onClick={() => setShowPreview(false)}><X size={18} /></button>
              </div>
            </div>
            <iframe srcDoc={previewHtml} style={{ flex: 1, border: "none", width: "100%" }} title="preview" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MODAL — CONFIRMAR DELETE
      ══════════════════════════════ */}
      {confirmDel && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Excluir proposta?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              A proposta de <strong>{confirmDel.company}</strong> será removida do banco de dados. O arquivo no Vercel continuará acessível.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => doDelete(confirmDel.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini componente de step de publicação ──
function PubStep({ label, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: done ? "#d1fae5" : active ? "#ede9fe" : "#f3f4f6",
        border: `1px solid ${done ? "#6ee7b7" : active ? "#a5b4fc" : "#e5e7eb"}`,
      }}>
        {done
          ? <Check size={14} color="#059669" />
          : active
          ? <div style={{ width: 14, height: 14, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          : null}
      </div>
      <span style={{ fontSize: 14, color: active ? "#111827" : done ? "#6b7280" : "#9ca3af", fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );
}
