import { Trigger } from "./types";

export const TRIGGERS: Trigger[] = [
  { id: "1", slug: "welcome", name: "Boas-vindas" },
  { id: "2", slug: "reminder", name: "Lembrete" },
  { id: "3", slug: "payment_due", name: "Vencimento" },
  { id: "4", slug: "payment_overdue", name: "Atraso de pagamento" },
  { id: "5", slug: "promotion", name: "Promoção" },
  { id: "6", slug: "reengagement", name: "Reengajamento" },
  { id: "7", slug: "confirmation", name: "Confirmação" },
  { id: "8", slug: "feedback", name: "Pesquisa de satisfação" },
  { id: "9", slug: "birthday", name: "Aniversário" },
  { id: "10", slug: "abandoned_cart", name: "Carrinho abandonado" },
];
