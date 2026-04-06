import { supabase } from "../lib/supabase";

// Mappers DB → App
const mapContact = ({ created_at, ...r }) => ({ ...r, createdAt: created_at });
const mapDeal = ({ contact_id, closing_date, ...r }) => ({ ...r, contactId: contact_id, closingDate: closing_date });
const mapActivity = ({ contact_id, deal_id, ...r }) => ({ ...r, contactId: contact_id, dealId: deal_id });

// Mappers App → DB
const toContact = ({ id, createdAt, ...r }) => r;
const toDeal = ({ id, contactId, closingDate, ...r }) => ({ ...r, contact_id: contactId || null, closing_date: closingDate || null });
const toActivity = ({ id, contactId, dealId, ...r }) => ({ ...r, contact_id: contactId || null, deal_id: dealId || null });

// --- Contacts ---
export async function getContacts() {
  const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
  return (data || []).map(mapContact);
}

export async function addContact(contact) {
  const { data } = await supabase.from("contacts").insert([toContact(contact)]).select().single();
  return mapContact(data);
}

export async function updateContact(id, updates) {
  const { createdAt, ...rest } = updates;
  await supabase.from("contacts").update(rest).eq("id", id);
}

export async function deleteContact(id) {
  await supabase.from("contacts").delete().eq("id", id);
}

// --- Deals ---
export async function getDeals() {
  const { data } = await supabase.from("deals").select("*").order("id", { ascending: false });
  return (data || []).map(mapDeal);
}

export async function addDeal(deal) {
  const { data } = await supabase.from("deals").insert([toDeal(deal)]).select().single();
  return mapDeal(data);
}

export async function updateDeal(id, updates) {
  await supabase.from("deals").update(toDeal({ ...updates, id })).eq("id", id);
}

export async function deleteDeal(id) {
  await supabase.from("deals").delete().eq("id", id);
}

// --- Activities ---
export async function getActivities() {
  const { data } = await supabase.from("activities").select("*").order("date", { ascending: false });
  return (data || []).map(mapActivity);
}

export async function addActivity(activity) {
  const { data } = await supabase.from("activities").insert([toActivity(activity)]).select().single();
  return mapActivity(data);
}

export async function updateActivity(id, updates) {
  await supabase.from("activities").update(toActivity({ ...updates, id })).eq("id", id);
}

export async function deleteActivity(id) {
  await supabase.from("activities").delete().eq("id", id);
}

// --- Tickets ---
const mapTicket = ({ contact_id, created_at, updated_at, ...r }) => ({
  ...r, contactId: contact_id, createdAt: created_at, updatedAt: updated_at,
});
const toTicket = ({ id, contactId, createdAt, updatedAt, ...r }) => ({
  ...r, contact_id: contactId || null,
});

export async function getTickets() {
  const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
  return (data || []).map(mapTicket);
}

export async function addTicket(ticket) {
  const { data } = await supabase.from("tickets").insert([toTicket(ticket)]).select().single();
  return mapTicket(data);
}

export async function updateTicket(id, updates) {
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("tickets").update({ ...toTicket({ ...updates, id }), updated_at: today }).eq("id", id);
}

export async function deleteTicket(id) {
  await supabase.from("tickets").delete().eq("id", id);
}

// --- Leads ---
export async function getLeads() {
  const { data } = await supabase.from("leads").select("*").order("data", { ascending: false });
  return data || [];
}

export async function addLead(lead) {
  const { data } = await supabase.from("leads").insert([lead]).select().single();
  return data;
}

export async function updateLead(id, updates) {
  await supabase.from("leads").update(updates).eq("id", id);
}

export async function deleteLead(id) {
  await supabase.from("leads").delete().eq("id", id);
}
