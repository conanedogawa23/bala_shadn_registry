import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Phone, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Client status options for visual indicators
 */
export type ClientStatus = "active" | "inactive" | "pending";

/**
 * Interface for client data to be displayed in the ClientCard
 * @interface ClientData
 */
export interface ClientData {
  /** Unique identifier for the client */
  id: string;
  /** Client's full name */
  name: string;
  /** Client's email address */
  email: string;
  /** Client's phone number */
  phone?: string;
  /** Client's address */
  address?: string;
  /** URL to client's avatar/profile image */
  avatarUrl?: string;
  /** Client's current status */
  status?: ClientStatus;
  /** Whether client is marked as favorite */
  isFavorite?: boolean;
  /** Additional notes about the client */
  notes?: string;
}

/**
 * Props for the ClientCard component
 * @interface ClientCardProps
 */
export interface ClientCardProps {
  /** Client data to display */
  client: ClientData;
  /** Optional CSS class names */
  className?: string;
  /** Handler for edit button click */
  onEdit?: (client: ClientData) => void;
  /** Handler for delete button click */
  onDelete?: (clientId: string) => void;
  /** Handler for favorite toggle */
  onToggleFavorite?: (clientId: string, isFavorite: boolean) => void;
  /** Whether the card is in a loading state */
  isLoading?: boolean;
  /** Whether actions (edit, delete) are disabled */
  actionsDisabled?: boolean;
}

/**
 * Status badge colors mapped to client statuses
 */
const statusVariants: Record<ClientStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

/**
 * ClientCard Component
 *
 * A card component that displays client information with actions for editing and deleting.
 * Follows shadcn/ui styling patterns and is fully accessible.
 *
 * @param props - {@link ClientCardProps}
 * @returns JSX.Element
 */
export function ClientCard({
  client,
  className,
  onEdit,
  onDelete,
  onToggleFavorite,
  isLoading = false,
  actionsDisabled = false,
}: ClientCardProps) {
  const { id, name, email, phone, address, avatarUrl, status = "active", isFavorite = false } = client;

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    if (onEdit && !actionsDisabled) {
      onEdit(client);
    }
  };

  const handleDelete = () => {
    if (onDelete && !actionsDisabled) {
      onDelete(id);
    }
  };

  const handleFavoriteToggle = () => {
    if (onToggleFavorite && !actionsDisabled) {
      onToggleFavorite(id, !isFavorite);
    }
  };

  return (
    <Card className={cn("w-full overflow-hidden transition-all hover:shadow-md", 
      isLoading && "animate-pulse", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-muted">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              {status && (
                <Badge variant="outline" className={cn("text-xs", statusVariants[status])}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          disabled={actionsDisabled}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            isFavorite && "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500"
          )}
        >
          <Star className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        {(phone || address) && (
          <div className="grid gap-2">
            {phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}
            {client.notes && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {client.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={actionsDisabled || !onEdit}
                aria-label="Edit client"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit client details</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={actionsDisabled || !onDelete}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete client"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete this client</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

