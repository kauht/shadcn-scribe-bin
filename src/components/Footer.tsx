import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-dashed border-border/50 py-6 md:py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
        <div className="text-center md:text-left text-sm">
          <p>© {new Date().getFullYear()} kaught.cc. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
          <Link to="/terms" className="text-sm hover:underline">Terms</Link>
          <Link to="/privacy" className="text-sm hover:underline">Privacy</Link>
          <Link to="/contact" className="text-sm hover:underline">Contact</Link>
          <Link to="/api" className="text-sm hover:underline">API</Link>
        </nav>
      </div>
    </footer>
  );
}
