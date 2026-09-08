export type ThemeMode = "light" | "dark" | "system";

export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("cf_admin_theme");
  if (saved === "light" || saved === "dark") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyTheme(theme: "light" | "dark") {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
  localStorage.setItem("cf_admin_theme", theme);
}
