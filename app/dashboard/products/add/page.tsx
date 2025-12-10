'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import Link from 'next/link';
import { RefreshCw, Sparkles } from 'lucide-react';

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
  const [stockLevel, setStockLevel] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Auto-generate code when category changes
  useEffect(() => {
    if (categoryId && !code) {
      generateProductCode();
    }
  }, [categoryId]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('submit-btn')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const generateProductCode = async () => {
    if (!categoryId) {
      setError('Please select a category first');
      return;
    }

    setGeneratingCode(true);
    setError('');

    try {
      const res = await fetch(`/api/products?action=generate-code&categoryId=${categoryId}`);
      const data = await res.json();

      if (res.ok) {
        setCode(data.code);
      } else {
        setError(data.error || 'Failed to generate code');
      }
    } catch (err) {
      setError('Failed to generate product code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    // Clear code so it auto-generates for new category
    setCode('');
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

      const data = await res.json();

      if (!res.ok) {
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
                <Label htmlFor="category">Category *</Label>
                <Select 
                  id="category" 
                  onValueChange={handleCategoryChange} 
                  value={categoryId}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
                <p className="text-xs text-gray-500">Select category first to auto-generate code</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Product Code *</Label>
                <div className="flex gap-2">
                  <Input 
                    id="code" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())} 
                    placeholder="AUTO-0001"
                    required 
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateProductCode}
                    disabled={!categoryId || generatingCode}
                    className="flex-shrink-0"
                  >
                    {generatingCode ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Auto-generated based on category</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Wireless Mouse"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Optional product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₱) *</Label>
                <Input 
                  id="unitPrice" 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={unitPrice} 
                  onChange={(e) => setUnitPrice(e.target.value)} 
                  placeholder="0.00"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockLevel">Initial Stock</Label>
                <Input 
                  id="stockLevel" 
                  type="number" 
                  min="0"
                  value={stockLevel} 
                  onChange={(e) => setStockLevel(e.target.value)} 
                  placeholder="0"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input 
                  id="reorderLevel" 
                  type="number" 
                  min="1"
                  value={reorderLevel} 
                  onChange={(e) => setReorderLevel(e.target.value)} 
                  placeholder="10"
                  required 
                />
                <p className="text-xs text-gray-500">Alert when stock falls below this</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select 
                id="supplier" 
                onValueChange={setSupplierId} 
                value={supplierId}
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Link href="/dashboard/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button 
                id="submit-btn"
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Adding Product...' : 'Add Product (Ctrl+S)'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
