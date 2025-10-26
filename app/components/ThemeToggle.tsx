"use client";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    // Default to dark if no stored preference
    const initial = stored ? stored === "dark" : true;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="inline-flex items-center gap-2 btn-secondary"
    >
      {dark ? <FaSun /> : <FaMoon />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}
