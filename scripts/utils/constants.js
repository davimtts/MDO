export const SESSION_KEY = "iris_user_session";

const isGithubPages = window.location.hostname.includes("github.io");

export const BASE_PATH = isGithubPages ? "/MDO" : "";

export const ROUTES = {
  home: `${BASE_PATH}/home/`,
  login: `${BASE_PATH}/login/`,
  inicio: `${BASE_PATH}/inicio/`,
  clientes: `${BASE_PATH}/clientes/`,
  oportunidades: `${BASE_PATH}/oportunidades/`
};

export function path(pathname) {
  return `${BASE_PATH}${pathname}`;
}