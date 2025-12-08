'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Download, Printer, CreditCard } from 'lucide-react';
import { generateReceiptPDF, printReceiptDirect } from '@/lib/receipt';

interface Sale {
  id: string;
  saleNumber: string;
  netAmount: number;
  taxAmount: number;
  discount: number;
  paymentMethod: string;
  createdAt: string;
  user: { fullName: string };
  saleItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: { name: string };
  }>;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const filtered = sales.filter(
      (sale) =>
        sale.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
        sale.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        sale.paymentMethod.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSales(filtered);
  }, [search, sales]);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (sale: Sale) => {
    printReceiptDirect(sale);
  };

  const handleDownloadReceipt = (sale: Sale) => {
    generateReceiptPDF(sale);
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: any = {
      'CASH': 'bg-green-100 text-green-800',
      'CARD': 'bg-blue-100 text-blue-800',
      'GCASH': 'bg-purple-100 text-purple-800',
      'PAYMAYA': 'bg-orange-100 text-orange-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-500 mt-1">View and manage all sales transactions</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by receipt number, cashier name, or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <p className="text-gray-500">No sales found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{sale.saleNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(sale.paymentMethod)}`}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₱{sale.netAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{sale.saleItems.length} items</p>
                    <p className="text-xs text-gray-400">by {sale.user.fullName}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 pb-4 border-b">
                  {expandedId === sale.id ? (
                    <div className="space-y-2">
                      {sale.saleItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="font-medium">₱{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {sale.saleItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-sm text-gray-600">
                          {item.product.name} × {item.quantity}
                        </div>
                      ))}
                      {sale.saleItems.length > 2 && (
                        <p className="text-sm text-blue-600 mt-1">
                          +{sale.saleItems.length - 2} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Total section */}
                <div className="space-y-1 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₱{(sale.netAmount - sale.taxAmount + sale.discount).toFixed(2)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span className="text-red-600">-₱{sale.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {sale.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>₱{sale.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">₱{sale.netAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {expandedId === sale.id ? 'Hide' : 'View'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintReceipt(sale)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReceipt(sale)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}