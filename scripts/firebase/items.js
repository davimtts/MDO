import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
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

export async function getItems() {
  const q = query(itemsRef, orderBy("item_data_create", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}