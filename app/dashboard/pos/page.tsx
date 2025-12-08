'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign } from 'lucide-react';
import { generateReceiptPDF, printReceiptDirect } from '@/lib/receipt';

interface Product {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
  stockLevel: number;
  category: { name: string };
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${search}`);
      const data = await res.json();
      setProducts(data.filter((p: Product) => p.stockLevel > 0));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stockLevel) {
        setCart(cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Not enough stock');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.stockLevel) {
              alert('Not enough stock');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = 0;
  const total = subtotal + tax;
  const change = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const processSale = async () => {
    if (paymentMethod === 'CASH' && (!receivedAmount || parseFloat(receivedAmount) < total)) {
      alert('Insufficient payment amount');
      return;
    }

    setProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          discount: 0,
          taxAmount: tax,
          paymentMethod,
        }),
      });

      if (res.ok) {
        const sale = await res.json();
        
        // Auto-print receipt
        printReceiptDirect(sale);
        
        // Reset
        setCart([]);
        setReceivedAmount('');
        setShowPayment(false);
        setPaymentMethod('CASH');
        fetchProducts();
        
        alert('Sale completed successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create sale');
      }
    } catch (error) {
      alert('Failed to create sale');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500 mt-1">Process sales transactions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : products.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No products found</p>
                ) : (
                  products.map((product) => (
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
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-green-600">₱{product.unitPrice.toFixed(2)}</p>
                        <Plus className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center py-16 text-gray-500">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{item.name}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">₱{item.unitPrice.toFixed(2)} each</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold">₱{(item.unitPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {!showPayment ? (
                    <Button className="w-full mt-4" onClick={handleCheckout}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Checkout
                    </Button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="CASH">Cash</option>
                          <option value="CARD">Debit/Credit Card</option>
                          <option value="GCASH">GCash</option>
                          <option value="PAYMAYA">PayMaya</option>
                        </select>
                      </div>

                      {paymentMethod === 'CASH' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">Amount Received</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={receivedAmount}
                              onChange={(e) => setReceivedAmount(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          {receivedAmount && (
                            <div className="flex justify-between font-bold">
                              <span>Change:</span>
                              <span className={change >= 0 ? 'text-blue-600' : 'text-red-600'}>
                                ₱{change.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={processSale}
                          disabled={processing}
                        >
                          {processing ? 'Processing...' : 'Complete Sale'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPayment(false);
                            setReceivedAmount('');
                          }}
                        >
                          Back
                        </Button>
                      </div>
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