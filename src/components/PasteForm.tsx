
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  getLanguages, 
  getExpiryOptions, 
  getExpiryDate
} from "@/lib/utils";
import { createPaste, getCurrentUser } from "@/lib/pasteStore";

export function PasteForm() {
  const navigate = useNavigate();
  const languages = getLanguages();
  const expiryOptions = getExpiryOptions();
  const currentUser = getCurrentUser();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiry, setExpiry] = useState("never");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [burnAfterRead, setBurnAfterRead] = useState(false);

  const handleExpiryChange = (value: string) => {
    setExpiry(value);
    if (value === "burn") {
      setBurnAfterRead(true);
    } else if (burnAfterRead) {
      setBurnAfterRead(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Paste content cannot be empty");
      return;
    }

    try {
      const expireAt = getExpiryDate(expiry);
      
      const paste = createPaste({
        title: title || "Untitled",
        content,
        language,
        expireAt,
        userId: currentUser?.id || null,
        isPrivate,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
        burnAfterRead: expiry === "burn" || burnAfterRead,
      });

      toast.success("Paste created successfully");
      navigate(`/paste/${paste.id}`);
    } catch (error) {
      toast.error("Failed to create paste");
      console.error(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <FormField>
          <FormItem>
            <FormLabel htmlFor="title">Title (optional)</FormLabel>
            <FormControl>
              <Input
                id="title"
                placeholder="Untitled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField>
          <FormItem className="flex flex-col">
            <FormLabel htmlFor="content">Content</FormLabel>
            <FormControl>
              <Textarea
                id="content"
                className="font-mono min-h-[300px] md:min-h-[400px] resize-y"
                placeholder="Paste your code here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </FormControl>
          </FormItem>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField>
            <FormItem>
              <FormLabel htmlFor="language">Syntax Highlighting</FormLabel>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <FormControl>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <FormLabel htmlFor="expiry">Expire After</FormLabel>
              <Select
                value={expiry}
                onValueChange={handleExpiryChange}
              >
                <FormControl>
                  <SelectTrigger id="expiry">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField>
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={(checked) => 
                      setIsPrivate(checked === true)
                    }
                  />
                </FormControl>
                <FormLabel htmlFor="private" className="text-sm font-normal">
                  Private (not listed publicly)
                </FormLabel>
              </FormItem>
            </FormField>

            <FormField>
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="burn"
                    checked={burnAfterRead || expiry === "burn"}
                    onCheckedChange={(checked) => 
                      setBurnAfterRead(checked === true)
                    }
                    disabled={expiry === "burn"}
                  />
                </FormControl>
                <FormLabel htmlFor="burn" className="text-sm font-normal">
                  Burn after read
                </FormLabel>
              </FormItem>
            </FormField>
          </div>

          <div className="space-y-4">
            <FormField>
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="password-protected"
                    checked={isPasswordProtected}
                    onCheckedChange={(checked) => {
                      setIsPasswordProtected(checked === true);
                      if (checked !== true) {
                        setPassword("");
                      }
                    }}
                  />
                </FormControl>
                <FormLabel
                  htmlFor="password-protected"
                  className="text-sm font-normal"
                >
                  Password protected
                </FormLabel>
              </FormItem>
            </FormField>

            {isPasswordProtected && (
              <FormField>
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isPasswordProtected}
                    />
                  </FormControl>
                </FormItem>
              </FormField>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto">
          Create Paste
        </Button>
      </div>
    </Form>
  );
}
