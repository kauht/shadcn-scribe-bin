import { useState } from "react";
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
import { createPaste, getCurrentUser } from "@/lib/pasteStore";

export function PasteForm() {
  const navigate = useNavigate();
  const languages = getLanguages();
  const expiryOptions = getExpiryOptions();
  const currentUser = getCurrentUser();
  
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [burnAfterRead, setBurnAfterRead] = useState(false);

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

  const handleExpiryChange = (value: string) => {
    form.setValue("expiry", value);
    if (value === "burn") {
      setBurnAfterRead(true);
    } else if (burnAfterRead) {
      setBurnAfterRead(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!values.content.trim()) {
      toast.error("Paste content cannot be empty");
      return;
    }

    try {
      const expireAt = getExpiryDate(values.expiry);
      
      const paste = createPaste({
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

      toast.success("Paste created successfully");
      navigate(`/paste/${paste.id}`, { replace: true });
    } catch (error) {
      console.error("Failed to create paste:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create paste");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="expiry">Expire After</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleExpiryChange(value);
                  }}
                  defaultValue={field.value}
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
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="private"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="private" className="text-sm font-normal">
                    Private (not listed publicly)
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="burn"
                      checked={burnAfterRead || field.value === "burn"}
                      onCheckedChange={(checked) => {
                        setBurnAfterRead(checked === true);
                        if (checked === true && field.value !== "burn") {
                          form.setValue("expiry", "burn");
                        }
                      }}
                      disabled={field.value === "burn"}
                    />
                  </FormControl>
                  <FormLabel htmlFor="burn" className="text-sm font-normal">
                    Burn after read
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-row items-center gap-2 space-y-0">
              <Checkbox
                id="password-protected"
                checked={isPasswordProtected}
                onCheckedChange={(checked) => {
                  setIsPasswordProtected(checked === true);
                  if (checked !== true) {
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

        <Button type="submit" className="w-full md:w-auto">
          Create Paste
        </Button>
      </form>
    </Form>
  );
}
