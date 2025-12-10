'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, Scan, X } from 'lucide-react';
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
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(true);
  const [scannedCode, setScannedCode] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef('');
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // Barcode Scanner Support with Edge Cases
  useEffect(() => {
    if (!barcodeScannerActive) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Clear previous timeout
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }

      // Add character to buffer
      if (e.key === 'Enter') {
        // Barcode complete - process it
        if (barcodeBufferRef.current.length >= 3) {
          processBarcodeScanner(barcodeBufferRef.current);
        }
        barcodeBufferRef.current = '';
      } else if (e.key.length === 1) {
        // Single character - add to buffer
        barcodeBufferRef.current += e.key;
      }

      // Auto-clear buffer after 100ms of inactivity
      barcodeTimeoutRef.current = setTimeout(() => {
        barcodeBufferRef.current = '';
      }, 100);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [barcodeScannerActive, products]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Focus search
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // F4 - Toggle barcode scanner
      if (e.key === 'F4') {
        e.preventDefault();
        setBarcodeScannerActive(!barcodeScannerActive);
      }
      // F9 - Checkout
      if (e.key === 'F9' && cart.length > 0 && !showPayment) {
        e.preventDefault();
        handleCheckout();
      }
      // Esc - Clear cart or cancel payment
      if (e.key === 'Escape') {
        if (showPayment) {
          setShowPayment(false);
          setReceivedAmount('');
        } else if (cart.length > 0) {
          if (confirm('Clear entire cart?')) {
            setCart([]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showPayment, barcodeScannerActive]);

  const processBarcodeScanner = async (code: string) => {
    setScannedCode(code);
    
    // Search for product by code
    const product = products.find(p => 
      p.code.toUpperCase() === code.toUpperCase()
    );

    if (product) {
      addToCart(product);
      // Visual feedback
      setTimeout(() => setScannedCode(''), 1000);
    } else {
      // Product not found - try fetching
      try {
        const res = await fetch(`/api/products?search=${code}`);
        const data = await res.json();
        const foundProduct = data.find((p: Product) => 
          p.code.toUpperCase() === code.toUpperCase() && p.stockLevel > 0
        );

        if (foundProduct) {
          addToCart(foundProduct);
          setProducts([...products, foundProduct]);
        } else {
          alert(`Product not found: ${code}`);
        }
      } catch (error) {
        alert('Failed to search product');
      }
      setTimeout(() => setScannedCode(''), 2000);
    }
  };

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
        alert(`Insufficient stock for ${product.name}. Only ${product.stockLevel} available.`);
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
              alert(`Not enough stock. Maximum: ${item.stockLevel}`);
              return item;
            }
            if (newQty < 1) return item; // Will be filtered out
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
  const change = receivedAmount ? Math.max(0, parseFloat(receivedAmount) - total) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const processSale = async () => {
    // Validation
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (paymentMethod === 'CASH') {
      if (!receivedAmount || receivedAmount.trim() === '') {
        alert('Please enter amount received');
        return;
      }
      const received = parseFloat(receivedAmount);
      if (isNaN(received) || received < total) {
        alert(`Insufficient payment. Total: ₱${total.toFixed(2)}, Received: ₱${received.toFixed(2)}`);
        return;
      }
    }

    setProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        alert('User session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
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

      const data = await res.json();

      if (res.ok) {
        // Auto-print receipt
        try {
          printReceiptDirect(data);
        } catch (printError) {
          console.error('Print error:', printError);
          // Continue even if print fails
        }
        
        // Reset everything
        setCart([]);
        setReceivedAmount('');
        setShowPayment(false);
        setPaymentMethod('CASH');
        fetchProducts();
        
        alert(`Sale completed! Change: ₱${change.toFixed(2)}`);
      } else {
        alert(data.error || 'Failed to create sale');
      }
    } catch (error) {
      alert('Failed to create sale. Please try again.');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-500 mt-1">Process sales transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {scannedCode && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium animate-pulse">
              Scanned: {scannedCode}
            </div>
          )}
          <Button
            variant={barcodeScannerActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBarcodeScannerActive(!barcodeScannerActive)}
            title="Toggle Barcode Scanner (F4)"
          >
            <Scan className="h-4 w-4 mr-2" />
            {barcodeScannerActive ? 'Scanner ON' : 'Scanner OFF'}
          </Button>
        </div>
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
                    ref={searchInputRef}
                    placeholder="Search products... (F2)"
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products found</p>
                    {search && (
                      <Button
                        variant="link"
                        onClick={() => setSearch('')}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.code} • {product.category.name} • Stock: {product.stockLevel}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
                {cart.length > 0 && !showPayment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirm('Clear cart?') && setCart([])}
                    title="Clear Cart (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">Cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Scan or click products to add</p>
                </div>
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
                              disabled={item.quantity >= item.stockLevel}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold">₱{(item.unitPrice * item.quantity).toFixed(2)}</p>
                        </div>
                        {item.quantity >= item.stockLevel && (
                          <p className="text-xs text-orange-600 mt-1">Maximum stock reached</p>
                        )}
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
                      Checkout (F9)
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
                            <label className="block text-sm font-medium mb-1">Amount Received *</label>
                            <Input
                              type="number"
                              step="0.01"
                              min={total}
                              value={receivedAmount}
                              onChange={(e) => setReceivedAmount(e.target.value)}
                              placeholder={`Minimum: ${total.toFixed(2)}`}
                              autoFocus
                            />
                          </div>
                          {receivedAmount && (
                            <div className="flex justify-between font-bold text-lg">
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
                          disabled={processing}
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

          {/* Keyboard Shortcuts Help */}
          <Card className="mt-4">
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">F2</kbd> - Focus Search</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">F4</kbd> - Toggle Scanner</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">F9</kbd> - Checkout</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> - Clear Cart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
