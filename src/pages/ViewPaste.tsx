
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CodeViewer } from "@/components/CodeViewer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getPasteById, incrementViewCount } from "@/lib/pasteStore";
import { Paste } from "@/lib/types";

const ViewPaste = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Paste not found");
      setLoading(false);
      return;
    }

    try {
      const pasteData = getPasteById(id);
      
      if (!pasteData) {
        setError("Paste not found");
        setLoading(false);
        return;
      }

      if (pasteData.isPasswordProtected && !passwordVerified) {
        setNeedsPassword(true);
        setLoading(false);
      } else {
        setPaste(pasteData);
        incrementViewCount(id);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load paste");
      setLoading(false);
    }
  }, [id, passwordVerified]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      const pasteData = getPasteById(id);
      
      if (!pasteData) {
        setError("Paste not found");
        return;
      }
      
      if (pasteData.password === password) {
        setPasswordVerified(true);
        setPaste(pasteData);
        incrementViewCount(id);
        setNeedsPassword(false);
      } else {
        toast.error("Incorrect password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify password");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : needsPassword ? (
                <div className="bg-card p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">This paste is password protected</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <Button type="submit">Submit</Button>
                  </form>
                </div>
              ) : paste ? (
                <div>
                  <h1 className="text-2xl font-bold mb-4">{paste.title}</h1>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Created: {new Date(paste.createdAt).toLocaleString()}</p>
                    {paste.expireAt && (
                      <p>Expires: {new Date(paste.expireAt).toLocaleString()}</p>
                    )}
                    <p>Views: {paste.viewCount}</p>
                  </div>
                  <CodeViewer code={paste.content} language={paste.language} />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ViewPaste;
