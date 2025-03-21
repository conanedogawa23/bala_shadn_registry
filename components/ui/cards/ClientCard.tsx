import * as React from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Calendar, Edit, Trash } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Client data interface
 */
export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  joinDate?: string | Date;
  profileImage?: string;
  status?: "active" | "inactive" | "pending";
  tags?: string[];
}

/**
 * Props for the ClientCard component
 */
export interface ClientCardProps {
  /**
   * Client data to display
   */
  client: ClientData;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Callback when edit button is clicked
   */
  onEdit?: (client: ClientData) => void;
  
  /**
   * Callback when delete button is clicked
   */
  onDelete?: (client: ClientData) => void;
  
  /**
   * Callback when card is clicked
   */
  onClick?: (client: ClientData) => void;
  
  /**
   * If true, makes the entire card clickable
   */
  clickable?: boolean;
}

/**
 * ClientCard Component
 * 
 * Displays client information in a card format with optional actions.
 * 
 * @example
 * ```tsx
 * <ClientCard 
 *   client={client}
 *   onEdit={(client) => handleEdit(client)}
 *   onDelete={(client) => handleDelete(client)}
 * />
 * ```
 */
export function ClientCard({
  client,
  className,
  onEdit,
  onDelete,
  onClick,
  clickable = false,
}: ClientCardProps) {
  const handleCardClick = () => {
    if (clickable && onClick) {
      onClick(client);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(client);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(client);
    }
  };

  // Determine status badge color
  const statusColorMap = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md", 
        clickable && "cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {client.profileImage ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={client.profileImage}
                  alt={`${client.name} profile`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                <User size={24} />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{client.name}</CardTitle>
              {client.status && (
                <Badge 
                  variant="outline"
                  className={statusColorMap[client.status] || ""}
                >
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-4">
        {client.email && (
          <div className="flex items-center text-sm">
            <Mail size={16} className="mr-2 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
        )}
        
        {client.phone && (
          <div className="flex items-center text-sm">
            <Phone size={16} className="mr-2 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
        )}
        
        {client.address && (
          <div className="flex items-start text-sm">
            <MapPin size={16} className="mr-2 mt-0.5 text-muted-foreground" />
            <span>{client.address}</span>
          </div>
        )}
        
        {client.joinDate && (
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-2 text-muted-foreground" />
            <span>
              Joined: {client.joinDate instanceof Date
                ? client.joinDate.toLocaleDateString()
                : client.joinDate
              }
            </span>
          </div>
        )}
        
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {(onEdit || onDelete) && (
        <CardFooter className="flex justify-end space-x-2 pt-0">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDelete}>
              <Trash size={16} className="mr-1" />
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
