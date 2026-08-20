import { Plus, Phone, Clock, Search, Users } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const FloatingActionButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mb-2" sideOffset={8}>
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <Phone className="mr-2 h-4 w-4 text-blue-500" />
            <span>Call Client</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <Clock className="mr-2 h-4 w-4 text-orange-500" />
            <span>Follow Up</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <Search className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Search</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Recent Clients</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
