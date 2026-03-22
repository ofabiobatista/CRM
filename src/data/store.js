// Simple in-memory store with localStorage persistence

const defaultData = {
  contacts: [
    { id: 1, name: "Ana Souza", email: "ana@empresa.com.br", phone: "(11) 99123-4567", company: "Tech Solutions", status: "cliente", tags: ["vip"], createdAt: "2026-01-15" },
    { id: 2, name: "Carlos Lima", email: "carlos@startup.io", phone: "(21) 98765-4321", company: "Startup IO", status: "lead", tags: ["novo"], createdAt: "2026-02-01" },
    { id: 3, name: "Fernanda Rocha", email: "f.rocha@corp.com", phone: "(31) 97654-3210", company: "Corp LTDA", status: "prospect", tags: [], createdAt: "2026-02-20" },
  ],
  deals: [
    { id: 1, title: "Plano Enterprise", contactId: 1, value: 15000, stage: "fechado", probability: 100, closingDate: "2026-03-10", notes: "Contrato assinado" },
    { id: 2, title: "Implantação CRM", contactId: 2, value: 8500, stage: "negociacao", probability: 60, closingDate: "2026-04-15", notes: "Aguardando aprovação interna" },
    { id: 3, title: "Consultoria Mensal", contactId: 3, value: 3200, stage: "proposta", probability: 40, closingDate: "2026-04-30", notes: "Enviada proposta por email" },
  ],
  activities: [
    { id: 1, type: "ligacao", contactId: 1, dealId: 1, description: "Ligação de follow-up sobre renovação", date: "2026-03-18", done: true },
    { id: 2, type: "email", contactId: 2, dealId: 2, description: "Envio de proposta comercial", date: "2026-03-19", done: true },
    { id: 3, type: "reuniao", contactId: 3, dealId: 3, description: "Reunião de apresentação do produto", date: "2026-03-22", done: false },
    { id: 4, type: "tarefa", contactId: 2, dealId: null, description: "Preparar material de onboarding", date: "2026-03-25", done: false },
  ],
};

function load() {
  try {
    const saved = localStorage.getItem("crm_data");
    return saved ? JSON.parse(saved) : defaultData;
  } catch {
    return defaultData;
  }
}

function save(data) {
  localStorage.setItem("crm_data", JSON.stringify(data));
}

let state = load();

export function getContacts() { return state.contacts; }
export function getDeals() { return state.deals; }
export function getActivities() { return state.activities; }

export function addContact(contact) {
  const id = Date.now();
  state.contacts = [...state.contacts, { ...contact, id, createdAt: new Date().toISOString().split("T")[0] }];
  save(state);
  return state.contacts;
}

export function updateContact(id, updates) {
  state.contacts = state.contacts.map(c => c.id === id ? { ...c, ...updates } : c);
  save(state);
  return state.contacts;
}

export function deleteContact(id) {
  state.contacts = state.contacts.filter(c => c.id !== id);
  state.deals = state.deals.filter(d => d.contactId !== id);
  state.activities = state.activities.filter(a => a.contactId !== id);
  save(state);
}

export function addDeal(deal) {
  const id = Date.now();
  state.deals = [...state.deals, { ...deal, id }];
  save(state);
  return state.deals;
}

export function updateDeal(id, updates) {
  state.deals = state.deals.map(d => d.id === id ? { ...d, ...updates } : d);
  save(state);
  return state.deals;
}

export function deleteDeal(id) {
  state.deals = state.deals.filter(d => d.id !== id);
  save(state);
}

export function addActivity(activity) {
  const id = Date.now();
  state.activities = [...state.activities, { ...activity, id }];
  save(state);
  return state.activities;
}

export function updateActivity(id, updates) {
  state.activities = state.activities.map(a => a.id === id ? { ...a, ...updates } : a);
  save(state);
  return state.activities;
}

export function deleteActivity(id) {
  state.activities = state.activities.filter(a => a.id !== id);
  save(state);
}
