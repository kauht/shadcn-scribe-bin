import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { getCurrentUser } from "@/lib/pasteStore";
import { api } from "@/lib/api";

export function PasteForm() {
  // Get required data
  const languages = getLanguages();
  const expiryOptions = getExpiryOptions();
  const currentUser = getCurrentUser();
  
  // State variables
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      language: "plaintext",
      expiry: "never",
      isPrivate: false,
      password: "",
    }
  });

  const navigate = useNavigate();

  // Handle expiry option changes
  const handleExpiryChange = useCallback((value: string) => {
    form.setValue("expiry", value);
    if (value === "burn") {
      setBurnAfterRead(true);
    } else if (burnAfterRead) {
      setBurnAfterRead(false);
    }
  }, [form, burnAfterRead]);

  // Handle form submission
  const onSubmit = form.handleSubmit(async (values) => {
    // Validate content
    if (!values.content || values.content.trim() === "") {
      toast.error("Paste content cannot be empty");
      return;
    }

    // Show loading state
    setIsSubmitting(true);

    try {
      // Calculate expiry date
      const expireAt = getExpiryDate(values.expiry);
      
      // Create paste
      const paste = await api.createPaste({
        title: values.title || "Untitled",
        content: values.content,
        language: values.language,
        expireAt,
        userId: currentUser?.id || "anonymous",
        isPrivate: values.isPrivate,
        isPasswordProtected,
        password: isPasswordProtected ? values.password : undefined,
        burnAfterRead: values.expiry === "burn" || burnAfterRead,
      });

      console.log("Created paste:", paste);
      
      // Show success message
      toast.success("Paste created successfully");
      
      // Navigate to the paste view
      navigate(`/paste/${paste.id}`);
    } catch (error) {
      console.error("Failed to create paste:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create paste");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="title">Title (optional)</FormLabel>
              <FormControl>
                <Input
                  id="title"
                  placeholder="Untitled"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="content">Content</FormLabel>
              <FormControl>
                <Textarea
                  id="content"
                  className="font-mono min-h-[300px] md:min-h-[400px] resize-y"
                  placeholder="Paste your code here..."
                  {...field}
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="language">Syntax Highlighting</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="expiry">Expiration</FormLabel>
                <Select
                  onValueChange={handleExpiryChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="expiry">
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expiryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="is-private"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="is-private"
                    className="text-sm font-normal"
                  >
                    Private paste
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="password-protected"
                checked={isPasswordProtected}
                onCheckedChange={(checked) => {
                  setIsPasswordProtected(!!checked);
                  if (!checked) {
                    form.setValue("password", "");
                  }
                }}
              />
              <FormLabel
                htmlFor="password-protected"
                className="text-sm font-normal"
              >
                Password protected
              </FormLabel>
            </div>

            {isPasswordProtected && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        {...field}
                        required={isPasswordProtected}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Paste"}
        </Button>
      </form>
    </Form>
  );
}
