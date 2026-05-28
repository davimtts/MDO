import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./config.js";

const statusRef = collection(db, "settings_status");
const temperatureRef = collection(db, "settings_temperature");

export async function getStatuses() {
  const q = query(
    statusRef,
    orderBy("priority", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getTemperatures() {
  const q = query(
    temperatureRef,
    orderBy("priority", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}