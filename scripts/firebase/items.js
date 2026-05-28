import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./config.js";

const itemsRef = collection(db, "items");

export async function saveItem(item) {
  const docRef = await addDoc(itemsRef, item);

  return {
    id: docRef.id,
    ...item
  };
}

export async function getItems(clientIds = []) {

  if (!clientIds.length) {
    return [];
  }

  const chunks = [];

  for (let i = 0; i < clientIds.length; i += 10) {
    chunks.push(clientIds.slice(i, i + 10));
  }

  const results = await Promise.all(

    chunks.map(async idsChunk => {

      const q = query(
        itemsRef,
        where("client_id", "in", idsChunk),
        orderBy("item_data_create", "desc")
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    })

  );

  return results.flat();
}

export async function updateItem(itemId, data) {
  const ref = doc(db, "items", itemId);

  await updateDoc(ref, data);

  return {
    id: itemId,
    ...data
  };
}