'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
  stockLevel: number;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockLevel) {
        alert('Insufficient stock!');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      if (product.stockLevel < 1) {
        alert('Out of stock!');
        return;
      }
      setCart([...cart, { ...product, quantity: 1, subtotal: product.unitPrice }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    if (newQty > item.stockLevel) {
      alert('Insufficient stock!');
      return;
    }

    setCart(cart.map(i =>
      i.id === productId
        ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
        : i
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = 0; // Add tax calculation if needed
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items,
          discount: 0,
          taxAmount: 0,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const sale = await res.json();
      setSuccess(true);
      setCart([]);
      setTimeout(() => setSuccess(false), 3000);
      fetchProducts(); // Refresh stock levels
      alert(`Sale completed! Receipt #${sale.saleNumber}`);
    } catch (error: any) {
      alert(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = getTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500 mt-1">Process sales transactions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Search */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.code} • Stock: {product.stockLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₱{product.unitPrice.toFixed(2)}</p>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">₱{item.unitPrice.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="font-bold">₱{item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Complete Sale'}
                  </Button>

                  {success && (
                    <div className="text-center text-green-600 font-medium">
                      ✔ Sale completed successfully!
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}