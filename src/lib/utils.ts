import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/components/ui/sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short", 
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch(() => {
      toast.error("Failed to copy to clipboard");
    });
}

export function generateId(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getExpiryDate(expiryId: string): Date | null {
  const expiryOptions = getExpiryOptions();
  const option = expiryOptions.find(opt => opt.id === expiryId);
  
  if (!option || option.seconds === null) {
    return null;
  }
  
  const date = new Date();
  date.setSeconds(date.getSeconds() + option.seconds);
  return date;
}

export function getExpiryOptions(): Array<{ id: string; name: string; seconds: number | null }> {
  return [
    { id: "never", name: "Never", seconds: null },
    { id: "burn", name: "Burn after read", seconds: null },
    { id: "10m", name: "10 Minutes", seconds: 10 * 60 },
    { id: "1h", name: "1 Hour", seconds: 60 * 60 },
    { id: "1d", name: "1 Day", seconds: 24 * 60 * 60 },
    { id: "1w", name: "1 Week", seconds: 7 * 24 * 60 * 60 },
    { id: "1m", name: "1 Month", seconds: 30 * 24 * 60 * 60 },
  ];
}

export function getLanguages(): Array<{ id: string; name: string }> {
  return [
    { id: "plaintext", name: "Plain Text" },
    { id: "javascript", name: "JavaScript" },
    { id: "typescript", name: "TypeScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "csharp", name: "C#" },
    { id: "cpp", name: "C++" },
    { id: "php", name: "PHP" },
    { id: "ruby", name: "Ruby" },
    { id: "go", name: "Go" },
    { id: "rust", name: "Rust" },
    { id: "html", name: "HTML" },
    { id: "css", name: "CSS" },
    { id: "json", name: "JSON" },
    { id: "markdown", name: "Markdown" },
    { id: "sql", name: "SQL" },
    { id: "bash", name: "Bash" },
    { id: "powershell", name: "PowerShell" },
  ];
}
