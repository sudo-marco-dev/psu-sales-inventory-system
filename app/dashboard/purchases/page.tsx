'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Package, X, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
}

interface Supplier {
  id: string;
  companyName: string;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/purchases');
      const data = await res.json();
      setPurchases(data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

  const addItem = () => {
    if (!selectedProduct || quantity < 1 || unitCost <= 0) {
      alert('Please fill all item fields');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitCost,
      subtotal: quantity * unitCost,
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setUnitCost(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier || items.length === 0) {
      alert('Please select supplier and add at least one item');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const purchaseData = {
        userId: user.id,
        supplierId: selectedSupplier,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
        notes,
      };

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create purchase');
      }

      const purchase = await res.json();
      alert(`Purchase order created! PO #${purchase.purchaseNumber}`);
      
      // Reset form
      setShowForm(false);
      setSelectedSupplier('');
      setItems([]);
      setNotes('');
      fetchPurchases();
      fetchProducts(); // Refresh to show updated stock
    } catch (error: any) {
      alert(error.message || 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage restocking and purchase orders</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Purchase Order'}
        </Button>
      </div>

      {/* Purchase Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Supplier Selection */}
              <div>
                <Label htmlFor="supplier">Supplier *</Label>
                <select
                  id="supplier"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Items Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Add Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="product">Product</Label>
                    <select
                      id="product"
                      value={selectedProduct}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        const product = products.find(p => p.id === e.target.value);
                        if (product) setUnitCost(product.unitPrice);
                      }}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost (₱)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} units × ₱{item.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold">₱{item.subtotal.toFixed(2)}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold text-lg">Total Amount:</span>
                      <span className="font-bold text-xl text-green-600">₱{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No purchases yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first purchase order to restock inventory.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-lg">{purchase.purchaseNumber}</p>
                      <p className="text-sm text-gray-500">
                        {purchase.supplier.companyName} • {purchase.user.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(purchase.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-green-600">₱{purchase.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{purchase.purchaseItems.length} items</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {purchase.purchaseItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="font-medium">₱{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {purchase.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {purchase.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}