import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPaste } from "@/lib/pasteStore";
import { toast } from "sonner";

export function CreatePasteForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const paste = createPaste({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        language: formData.get("language") as string,
        expireAt: null,
        userId: "anonymous",
        isPrivate: false,
        isPasswordProtected: false,
        burnAfterRead: false,
      });

      toast.success("Paste created successfully");
      navigate(`/paste/${paste.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create paste");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ...existing form fields... */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Paste"}
      </Button>
    </form>
  );
}
