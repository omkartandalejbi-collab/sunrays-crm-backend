import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/common/ThemeProvider';
import { 
  Search, Moon, Sun as SunIcon, LogOut, User as UserIcon, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocation, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { NotificationDropdown } from '../components/common/NotificationDropdown';
import { GlobalSearch } from '../components/common/GlobalSearch';
import { mockNotifications } from '../mock/notifications';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(mockNotifications);
  const location = useLocation();

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Generate breadcrumbs based on pathname
  const paths = location.pathname.split('/').filter(p => p);
  const breadcrumbs = paths.map((path, index) => {
    const url = `/${paths.slice(0, index + 1).join('/')}`;
    const label = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    return { url, label };
  });

  return (
    <header className="sticky top-0 z-10 flex h-[72px] w-full items-center justify-between border-b border-border bg-white px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex flex-1 items-center gap-2">
        <nav className="flex items-center text-sm font-medium text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Home</Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.url}>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link 
                to={crumb.url} 
                className={index === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "hover:text-foreground transition-colors"}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 flex justify-center max-w-2xl px-4">
        <button 
          className="relative flex w-full max-w-lg items-center gap-2 rounded-full bg-muted/50 border border-border px-4 py-2 text-[15px] text-muted-foreground hover:bg-muted/80 transition-colors shadow-sm"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
        >
          <Search className="h-5 w-5" />
          <span>Search clients, emails, phone numbers...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-6 select-none items-center gap-1 rounded bg-background border px-2 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex flex-1 items-center justify-end gap-5">
        <div className="hidden lg:block">
          <p className="text-[14px] font-medium text-muted-foreground">
            {format(new Date(), "MMM do, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown 
            notifications={notifications} 
            onMarkAllAsRead={handleMarkAllAsRead} 
            onNotificationClick={handleNotificationClick} 
          />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 hover:bg-muted/50 p-1.5 rounded-full transition-colors cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[14px] font-semibold text-foreground leading-tight">{user?.name}</span>
                <span className="text-[12px] text-success font-medium flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  Online
                </span>
              </div>
              <Avatar className="h-9 w-9 border shadow-sm">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{user?.name?.charAt(0) || <UserIcon />}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border/50" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-2.5 cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="p-2.5 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <GlobalSearch />
    </header>
  );
};
