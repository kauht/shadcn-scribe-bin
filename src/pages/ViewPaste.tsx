import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePaste } from "@/hooks/usePaste";

const ViewPaste = () => {
  const { id } = useParams<{ id: string }>();
  const { paste, isLoading, error, incrementViewCount, checkPassword } = usePaste(id);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    if (paste?.isPasswordProtected && !passwordVerified) {
      setNeedsPassword(true);
    } else if (paste && !isLoading) {
      incrementViewCount();
    }
  }, [paste, isLoading, passwordVerified]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isValid = await checkPassword(password);
      if (isValid) {
        setPasswordVerified(true);
        incrementViewCount();
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
              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : error ? (
                <div className="text-center text-red-500">
                  {error instanceof Error ? error.message : JSON.stringify(error)}
                </div>
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
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-muted px-3 py-1 rounded-bl text-xs">
                      {paste.language}
                    </div>
                    <pre className="p-4 rounded-md bg-muted/50 border overflow-x-auto code-editor whitespace-pre-wrap">
                      <code>{paste.content}</code>
                    </pre>
                  </div>
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
