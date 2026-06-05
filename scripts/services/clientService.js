import { saveClient, getClients, updateClient } from "../firebase/clients.js";
import { saveItem, getItems, updateItem } from "../firebase/items.js";
import { getCurrentUser } from "./authService.js";

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

export async function getDashboardData() {
  const user = await requireUser();

  const clients = await getClients(user.id);

  const clientIds = clients.map(client => client.id);

  const items = await getItems(clientIds);

  const clientsWithItems = clients.map(client => {
    const clientItems = items.filter(item =>
      item.client_id === client.id
    );

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

export async function createClientWithOptionalItem(clientData, itemData) {
  const user = await requireUser();

  if (!clientData.client_nome.trim()) {
    throw new Error("Nome do cliente é obrigatório.");
  }

  if (!clientData.client_telefone.trim()) {
    throw new Error("Telefone do cliente é obrigatório.");
  }

  const now = new Date().toISOString();

  const client = await saveClient({
    user_id: user.id,
    client_nome: clientData.client_nome.trim(),
    client_telefone: clientData.client_telefone.trim(),
    client_origem: clientData.client_origem,
    client_obs: clientData.client_obs.trim(),
    client_data_create: now,
    client_ult_ctt: now
  });

  let item = null;

  if (itemData.item_nome.trim()) {
    item = await saveItem({
      client_id: client.id,
      item_nome: itemData.item_nome.trim(),
      item_preco: Number(itemData.item_preco) || 0,
      item_status: itemData.item_status,
      item_temperatura: itemData.item_temperatura,
      item_obs: itemData.item_obs.trim(),
      item_data_create: now,
      item_data_ult_ctt: now
    });
  }

  return {
    client,
    item
  };
}

export async function updateClientWithItems(clientData, itemsData) {
  await requireUser();

  const now = new Date().toISOString();

  await updateClient(clientData.id, {
    client_nome: clientData.client_nome.trim(),
    client_telefone: clientData.client_telefone.trim(),
    client_origem: clientData.client_origem,
    client_obs: clientData.client_obs.trim(),
    client_ult_ctt: now
  });

  for (const item of itemsData) {
    const payload = {
      client_id: clientData.id,
      item_nome: item.item_nome.trim(),
      item_preco: Number(item.item_preco) || 0,
      item_status: item.item_status,
      item_temperatura: item.item_temperatura,
      item_obs: item.item_obs.trim(),
      item_data_ult_ctt: now
    };

    if (item.id) {
      await updateItem(item.id, payload);
    } else if (item.item_nome.trim()) {
      await saveItem({
        ...payload,
        item_data_create: now
      });
    }
  }
}