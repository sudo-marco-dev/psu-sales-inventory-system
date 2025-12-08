'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Truck,
  Users,
  FileText,
  Receipt,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CASHIER', 'INVENTORY_CLERK'] },
    { name: 'POS (Sales)', path: '/dashboard/pos', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER'] },
    { name: 'Sales History', path: '/dashboard/sales', icon: Receipt, roles: ['ADMIN', 'CASHIER'] },
    { name: 'Products', path: '/dashboard/products', icon: Package, roles: ['ADMIN', 'INVENTORY_CLERK'] },
    { name: 'Purchases', path: '/dashboard/purchases', icon: Truck, roles: ['ADMIN', 'INVENTORY_CLERK'] },
    { name: 'Suppliers', path: '/dashboard/suppliers', icon: Users, roles: ['ADMIN', 'INVENTORY_CLERK'] },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['ADMIN'] },
    { name: 'Users', path: '/dashboard/users', icon: UserCog, roles: ['ADMIN'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-800 border-b border-slate-700">
          <h1 className="text-white font-bold text-sm leading-tight">Palawan State<br/>University</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-slate-800 rounded-lg">
            <div className="p-2 bg-blue-600 rounded-full">
              <UserIcon size={20} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className="mr-3 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 bg-slate-900 border-t border-slate-800">
          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-gray-800">PSU Sales & Inventory</span>
            <div className="w-6" />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}