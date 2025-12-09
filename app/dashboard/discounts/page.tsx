'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Tag, TrendingDown, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface Discount {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, [search, activeFilter]);

  const fetchDiscounts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeFilter !== 'all') params.append('active', activeFilter);

      const res = await fetch(`/api/discounts?${params}`);
      const data = await res.json();
      setDiscounts(data);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error('Failed to toggle discount:', error);
    }
  };

  const getTypeDisplay = (type: string, value: number) => {
    if (type === 'PERCENTAGE') return `${value}% OFF`;
    if (type === 'FIXED_AMOUNT') return `₱${value} OFF`;
    return type;
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.isActive && !isExpired(d.endDate)).length,
    expired: discounts.filter(d => isExpired(d.endDate)).length,
    totalUsage: discounts.reduce((sum, d) => sum + d.usageCount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discounts & Promotions</h1>
          <p className="text-gray-500 mt-1">Manage discount codes and promotional offers</p>
        </div>
        <Link href="/dashboard/discounts/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Discount
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Tag className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
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
                placeholder="Search by code, name, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">All Discounts</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Discounts List */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            Loading discounts...
          </CardContent>
        </Card>
      ) : discounts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No discounts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Create your first discount to attract customers'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {discounts.map((discount) => {
            const expired = isExpired(discount.endDate);
            const upcoming = isUpcoming(discount.startDate);
            
            return (
              <Card key={discount.id} className={expired ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-mono text-sm font-bold">
                          {discount.code}
                        </span>
                        <h3 className="text-xl font-bold">{discount.name}</h3>
                        {expired && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Expired
                          </span>
                        )}
                        {upcoming && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Upcoming
                          </span>
                        )}
                        {!expired && !upcoming && discount.isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {discount.description && (
                        <p className="text-gray-600 mb-3">{discount.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Discount</p>
                          <p className="font-bold text-green-600 text-lg">
                            {getTypeDisplay(discount.discountType, discount.discountValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Min. Purchase</p>
                          <p className="font-medium">₱{discount.minPurchase.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Usage</p>
                          <p className="font-medium">
                            {discount.usageCount}
                            {discount.usageLimit && ` / ${discount.usageLimit}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Valid Until</p>
                          <p className="font-medium">
                            {new Date(discount.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/discounts/${discount.id}`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={discount.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleActive(discount.id, discount.isActive)}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}