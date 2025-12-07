'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unitPrice: number;
  stockLevel: number;
  reorderLevel: number;
  category: { name: string };
  supplier: { companyName: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your inventory</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-gray-500">{product.code}</p>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category:</dt>
                    <dd className="font-medium">{product.category.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Price:</dt>
                    <dd className="font-medium text-green-600">₱{product.unitPrice.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Stock:</dt>
                    <dd className={`font-medium ${
                      product.stockLevel <= product.reorderLevel 
                        ? 'text-orange-600' 
                        : 'text-gray-900'
                    }`}>
                      {product.stockLevel} units
                      {product.stockLevel <= product.reorderLevel && ' (Low Stock)'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Supplier:</dt>
                    <dd className="font-medium text-sm truncate">{product.supplier.companyName}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}