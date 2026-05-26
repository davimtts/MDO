import { saveClient, getClients } from "../firebase/clients.js";
import { saveItem, getItems } from "../firebase/items.js";
import { getSession } from "./authService.js";

export async function createClientWithItem(clientData, itemData) {
  const session = getSession();

  if (!session) {
    throw new Error("Usuário não autenticado.");
  }

  if (!clientData.client_nome.trim()) {
    throw new Error("Nome do cliente é obrigatório.");
  }

  if (!clientData.client_telefone.trim()) {
    throw new Error("Telefone do cliente é obrigatório.");
  }

  if (!itemData.item_nome.trim()) {
    throw new Error("Nome do item é obrigatório.");
  }

  const now = new Date().toISOString();

  const client = await saveClient({
    user_id: session.key,
    client_nome: clientData.client_nome.trim(),
    client_telefone: clientData.client_telefone.trim(),
    client_origem: clientData.client_origem,
    client_obs: clientData.client_obs.trim(),
    client_data_create: now,
    client_ult_ctt: now
  });

  const item = await saveItem({
    client_id: client.id,
    item_nome: itemData.item_nome.trim(),
    item_preco: Number(itemData.item_preco) || 0,
    item_status: itemData.item_status,
    item_temperatura: itemData.item_temperatura,
    item_obs: itemData.item_obs.trim(),
    item_data_create: now,
    item_data_ult_ctt: now
  });

  return {
    client,
    item
  };
}

export async function getDashboardData() {
  const clients = await getClients();
  const items = await getItems();

  const clientsWithItems = clients.map(client => {
    const clientItems = items.filter(item => item.client_id === client.id);

    return {
      ...client,
      items: clientItems
    };
  });

  return {
    clients,
    items,
    clientsWithItems
  };
}