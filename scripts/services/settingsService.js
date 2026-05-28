import {
  getStatuses,
  getTemperatures
} from "../firebase/settings.js";

const settingsCache = {
  statuses: [],
  temperatures: []
};

export async function loadSettings() {
  const [statuses, temperatures] = await Promise.all([
    getStatuses(),
    getTemperatures()
  ]);

  settingsCache.statuses = statuses;
  settingsCache.temperatures = temperatures;

  return settingsCache;
}

export function getSettingsCache() {
  return settingsCache;
}

export function getStatusMap() {
  return Object.fromEntries(
    settingsCache.statuses.map(status => [
      status.id,
      status
    ])
  );
}

export function getTemperatureMap() {
  return Object.fromEntries(
    settingsCache.temperatures.map(temp => [
      temp.id,
      temp
    ])
  );
}