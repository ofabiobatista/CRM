import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vhkpsfpkoxwekbtgqsdr.supabase.co",
  "sb_publishable_1w-ki3ZQwe2Xm89C5DoI3A_FSaj4Xmv"
);

const VERIFY_TOKEN = "crm_candeeiro_zap_2026";

export default async function handler(req, res) {
  // Verificação do webhook pela Meta
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Token inválido");
  }

  // Receber mensagens do WhatsApp
  if (req.method === "POST") {
    try {
      const body = req.body;

      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "messages") {
              const value = change.value;
              const messages = value.messages || [];
              const contacts = value.contacts || [];

              for (const message of messages) {
                const from = message.from; // número do remetente
                if (!from) continue;

                const contact = contacts.find(c => c.wa_id === from);
                const name = contact?.profile?.name || from;
                const text = message.text?.body || message.type || "";

                // Verifica se o lead já existe
                const { data: existing } = await supabase
                  .from("leads")
                  .select("id")
                  .eq("telefone", from)
                  .maybeSingle();

                if (!existing) {
                  await supabase.from("leads").insert([{
                    nome: name,
                    telefone: `+${from}`,
                    origem: "WhatsApp",
                    mensagem: text,
                    lido: false,
                    data: new Date().toISOString().split("T")[0],
                  }]);
                }
              }
            }
          }
        }
      }

      return res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("Erro no webhook:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
