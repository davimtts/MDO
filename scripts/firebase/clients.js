import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./config.js";

const clientsRef = collection(db, "clients");

export async function saveClient(client) {
  const docRef = await addDoc(clientsRef, client);

  return {
    id: docRef.id,
    ...client
  };
}

export async function getClients(userId) {
  const q = query(
    clientsRef,
    where("user_id", "==", userId),
    orderBy("client_data_create", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function updateClient(clientId, data) {
  const ref = doc(db, "clients", clientId);

  await updateDoc(ref, data);

  return {
    id: clientId,
    ...data
  };
}