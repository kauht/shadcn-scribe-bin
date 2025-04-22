
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

import Index from "./pages/Index";
import ViewPaste from "./pages/ViewPaste";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPastes from "./pages/MyPastes";
import Settings from "./pages/Settings";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        {/* Vertical lines */}
        <div className="vertical-line vertical-line-left" />
        <div className="vertical-line vertical-line-right" />
        
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/paste/:id" element={<ViewPaste />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-pastes" element={<MyPastes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/:type(terms|privacy|contact|api)" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
