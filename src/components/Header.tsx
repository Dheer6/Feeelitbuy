import { ShoppingCart, Heart, User, Menu, Home, Package, LayoutDashboard, LogOut } from 'lucide-react';
import { User as UserType } from '../types';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  currentUser: UserType | null;
  cartItemCount: number;
  wishlistCount: number;
  onNavigate: (page: string) => void;
  onAuthClick: () => void;
  onLogout: () => void;
  currentPage: string;
}

export function Header({
  currentUser,
  cartItemCount,
  wishlistCount,
  onNavigate,
  onAuthClick,
  onLogout,
  currentPage,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <img src="/fib-logo.png" alt="Feel It Buy Logo" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="text-indigo-600">Feel It Buy</span>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '-4px' }}>
                Feel the Quality, Buy with Confidence
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'catalog'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'admin'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <button
              onClick={() => onNavigate('catalog')}
              className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border">
                  <DropdownMenuItem 
                    onClick={() => onNavigate('profile')}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onNavigate('order-tracking')}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onNavigate('admin')}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onAuthClick} size="sm">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem 
                  onClick={() => onNavigate('home')}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onNavigate('catalog')}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </DropdownMenuItem>
                {currentUser?.role === 'admin' && (
                  <DropdownMenuItem 
                    onClick={() => onNavigate('admin')}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
