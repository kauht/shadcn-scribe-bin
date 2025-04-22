import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { getPasteById, checkPassword } from "@/lib/pasteStore";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { Paste } from "@/lib/types";

export function CodeViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [burnWarningOpen, setBurnWarningOpen] = useState(false);

  const loadPaste = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const pasteData = await getPasteById(id);
      
      if (!pasteData) {
        toast.error("Paste not found or has expired");
        navigate("/");
        return;
      }

      if (pasteData.isPasswordProtected && !isPasswordRequired) {
        setIsPasswordRequired(true);
        return;
      }

      if (pasteData.burnAfterRead && !burnWarningOpen) {
        setBurnWarningOpen(true);
        return;
      }

      setPaste(pasteData);
    } catch (error) {
      console.error('Failed to load paste:', error);
      toast.error("Failed to load paste");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaste();
  }, [id]);
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (checkPassword(id, password)) {
      setIsPasswordRequired(false);
      loadPaste();
    } else {
      toast.error("Incorrect password");
    }
  };
  
  const handleBurnConfirm = () => {
    setBurnWarningOpen(false);
    loadPaste();
  };
  
  if (!id) {
    return <div>Invalid paste ID</div>;
  }
  
  if (isPasswordRequired) {
    return (
      <Dialog open={isPasswordRequired} onOpenChange={setIsPasswordRequired}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Protected</DialogTitle>
            <DialogDescription>
              This paste is password protected. Please enter the password to view it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4">
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (burnWarningOpen) {
    return (
      <AlertDialog open={burnWarningOpen} onOpenChange={setBurnWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Burn After Reading</AlertDialogTitle>
            <AlertDialogDescription>
              This paste will be permanently deleted after you view it. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate("/")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBurnConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (!paste) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{paste.title}</h1>
          <div className="text-sm text-muted-foreground">
            Created {formatDate(paste.createdAt)}
            {paste.expireAt && (
              <span> • Expires {formatDate(paste.expireAt)}</span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => copyToClipboard(paste.content)}
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute top-0 right-0 bg-muted px-3 py-1 rounded-bl text-xs">
          {getLanguages().find(l => l.id === paste.language)?.name || "Plain Text"}
        </div>
        <pre className="p-4 rounded-md bg-muted/50 border overflow-x-auto code-editor whitespace-pre-wrap">
          <code>{paste.content}</code>
        </pre>
      </div>
      
      {paste.burnAfterRead && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
          This paste has been deleted and won't be accessible again.
        </div>
      )}
    </div>
  );
}

function getLanguages() {
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
