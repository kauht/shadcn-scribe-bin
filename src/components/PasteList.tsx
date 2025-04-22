
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paste } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PasteListProps {
  pastes: Paste[];
  title?: string;
  description?: string;
}

export function PasteList({ pastes, title, description }: PasteListProps) {
  if (pastes.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No pastes found</h2>
        <p className="text-muted-foreground mb-6">
          You haven't created any pastes yet.
        </p>
        <Button asChild>
          <Link to="/">Create a Paste</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pastes.map((paste) => (
          <Card key={paste.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1">
                  {paste.title || "Untitled"}
                </CardTitle>
                {paste.isPrivate && (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
              <CardDescription>
                Created {formatDate(paste.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-20 overflow-hidden relative">
                <pre className="text-xs font-mono whitespace-pre-wrap line-clamp-4">
                  {paste.content}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="capitalize">
                  {paste.language}
                </Badge>
                {paste.burnAfterRead && (
                  <Badge variant="destructive">Burn after read</Badge>
                )}
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to={`/paste/${paste.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
