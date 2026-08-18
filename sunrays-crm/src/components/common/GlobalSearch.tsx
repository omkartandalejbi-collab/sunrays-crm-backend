import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator,
  Settings,
  User,
  Phone,
  Clock,
  Users
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command";
import { mockClients } from '../../mock/clients';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Clients">
          {mockClients.slice(0, 4).map(client => (
            <CommandItem 
              key={client.id}
              onSelect={() => runCommand(() => navigate(`/dashboard/assigned`))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>{client.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{client.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/assigned'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Assigned Clients</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/followups'))}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Follow Ups</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/call-history'))}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Call History</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard/profile'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
