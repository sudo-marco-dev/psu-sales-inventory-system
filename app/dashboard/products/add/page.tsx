'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  companyName: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockLevel, setStockLevel] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          description,
          unitPrice: parseFloat(unitPrice),
          stockLevel: parseInt(stockLevel),
          reorderLevel: parseInt(reorderLevel),
          categoryId,
          supplierId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add product');
        setLoading(false);
        return;
      }

      router.push('/dashboard/products');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to add a new product to your inventory.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Product Code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input id="unitPrice" type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockLevel">Stock Level</Label>
                <Input id="stockLevel" type="number" value={stockLevel} onChange={(e) => setStockLevel(e.target.value)} required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Re-order Level</Label>
                    <Input id="reorderLevel" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select id="category" onValueChange={setCategoryId} value={categoryId}>
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select id="supplier" onValueChange={setSupplierId} value={supplierId}>
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Link href="/dashboard/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
