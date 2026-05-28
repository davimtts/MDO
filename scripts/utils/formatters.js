export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

export function formatMoney(value) {
  const number = Number(value);

  if (!number || number <= 0) {
    return "";
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function formatShortDate(date) {
  if (!date) return "--/--";

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
}