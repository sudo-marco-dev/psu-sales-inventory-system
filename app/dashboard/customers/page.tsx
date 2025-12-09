'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Award, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email: string | null;
  phone: string | null;
  customerType: string;
  loyaltyPoints: number;
  storeCredit: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    sales: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WHOLESALE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.customerType === 'VIP').length,
    withCredit: customers.filter(c => c.storeCredit > 0).length,
    totalLoyalty: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500 mt-1">Manage customers, loyalty points, and store credit</p>
        </div>
        <Link href="/dashboard/customers/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Store Credit</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withCredit}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loyalty Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLoyalty.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or customer number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="">All Types</option>
              <option value="REGULAR">Regular</option>
              <option value="VIP">VIP</option>
              <option value="WHOLESALE">Wholesale</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            Loading customers...
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by adding your first customer'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/dashboard/customers/${customer.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <p className="text-sm text-gray-500">{customer.customerNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(customer.customerType)}`}>
                      {customer.customerType}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {customer.email && (
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {customer.phone}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Loyalty Points</p>
                        <p className="font-bold text-blue-600">{customer.loyaltyPoints}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Store Credit</p>
                        <p className="font-bold text-green-600">₱{customer.storeCredit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Sales</p>
                        <p className="font-bold">{customer._count?.sales || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}