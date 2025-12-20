import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Loader2 } from 'lucide-react';
import { useLogout, getUserInitials } from '@/hooks/useLogout';

type UserMenuProps = {
  userEmail: string;
};

/**
 * User menu component for authenticated users.
 * Displays user avatar, profile link, and logout button.
 * Uses useLogout hook for logout functionality.
 */
export function UserMenu({ userEmail }: UserMenuProps) {
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='bg-primary text-primary-foreground'>{getUserInitials(userEmail)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>Moje konto</p>
            <p className='text-xs leading-none text-muted-foreground'>{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href='/profile' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            <span>Profil</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className='cursor-pointer text-destructive focus:text-destructive'
        >
          {isLoggingOut ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <LogOut className='mr-2 h-4 w-4' />}
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
