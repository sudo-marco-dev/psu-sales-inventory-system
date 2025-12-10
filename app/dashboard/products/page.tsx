'use client';

import Link from 'next/link';
import { PlusCircle, Filter } from 'lucide-react';
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
  category: { id: string; name: string };
  supplier: { id: string; companyName: string };
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  companyName: string;
}

type FilterType = 'all' | 'low-stock' | 'out-of-stock' | 'in-stock';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, activeFilter, selectedCategory, selectedSupplier]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const applyFilters = () => {
    let filtered = products;

    // Text search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.category.name.toLowerCase().includes(searchLower)
      );
    }

    // Stock filter
    switch (activeFilter) {
      case 'low-stock':
        filtered = filtered.filter(p => p.stockLevel > 0 && p.stockLevel <= p.reorderLevel);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(p => p.stockLevel === 0);
        break;
      case 'in-stock':
        filtered = filtered.filter(p => p.stockLevel > p.reorderLevel);
        break;
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category.id === selectedCategory);
    }

    // Supplier filter
    if (selectedSupplier) {
      filtered = filtered.filter(p => p.supplier.id === selectedSupplier);
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveFilter('all');
    setSelectedCategory('');
    setSelectedSupplier('');
  };

  const getFilterCounts = () => {
    return {
      all: products.length,
      lowStock: products.filter(p => p.stockLevel > 0 && p.stockLevel <= p.reorderLevel).length,
      outOfStock: products.filter(p => p.stockLevel === 0).length,
      inStock: products.filter(p => p.stockLevel > p.reorderLevel).length,
    };
  };

  const counts = getFilterCounts();
  const hasActiveFilters = activeFilter !== 'all' || selectedCategory || selectedSupplier;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your inventory</p>
        </div>
        <div>
          <Link href="/dashboard/products/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, code, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters {hasActiveFilters && '•'}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All ({counts.all})
              </Button>
              <Button
                variant={activeFilter === 'in-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('in-stock')}
              >
                In Stock ({counts.inStock})
              </Button>
              <Button
                variant={activeFilter === 'low-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('low-stock')}
                className={counts.lowStock > 0 ? 'border-orange-500 text-orange-600' : ''}
              >
                Low Stock ({counts.lowStock})
              </Button>
              <Button
                variant={activeFilter === 'out-of-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('out-of-stock')}
                className={counts.outOfStock > 0 ? 'border-red-500 text-red-600' : ''}
              >
                Out of Stock ({counts.outOfStock})
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({products.filter(p => p.category.id === cat.id).length})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.companyName} ({products.filter(p => p.supplier.id === sup.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {(search || hasActiveFilters) && (
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {products.length === 0 ? 'No products yet' : 'No products match your filters'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {products.length === 0 
                  ? 'Get started by adding your first product.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockLevel > 0 && product.stockLevel <= product.reorderLevel;
            const isOutOfStock = product.stockLevel === 0;
            
            return (
              <Card key={product.id} className="transition-transform duration-200 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-gray-500">{product.code}</p>
                    </div>
                    {isOutOfStock && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Out
                      </span>
                    )}
                    {isLowStock && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Low
                      </span>
                    )}
                  </div>
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
                        isOutOfStock ? 'text-red-600' :
                        isLowStock ? 'text-orange-600' : 
                        'text-gray-900'
                      }`}>
                        {product.stockLevel} units
                        {isLowStock && ` (Alert: ${product.reorderLevel})`}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Supplier:</dt>
                      <dd className="font-medium text-sm truncate">{product.supplier.companyName}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
