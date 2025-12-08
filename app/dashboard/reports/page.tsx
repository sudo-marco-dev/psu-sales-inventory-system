'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, Package, DollarSign, Download, FileText } from 'lucide-react';
import {
  exportSalesReportToPDF,
  exportSalesReportToExcel,
  exportInventoryReportToPDF,
  exportInventoryReportToExcel,
  exportProfitLossToPDF,
  exportProfitLossToExcel,
} from '@/lib/export';

export default function ReportsPage() {
  const [salesPeriod, setSalesPeriod] = useState('today');
  const [plPeriod, setPlPeriod] = useState('month');
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [topProductsData, setTopProductsData] = useState<any>(null);
  const [profitLossData, setProfitLossData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchAllReports();
  }, [salesPeriod, plPeriod]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [sales, inventory, products, profitLoss] = await Promise.all([
        fetch(`/api/reports/sales-summary?period=${salesPeriod}`).then(r => r.json()),
        fetch('/api/reports/inventory-status').then(r => r.json()),
        fetch('/api/reports/top-products').then(r => r.json()),
        fetch(`/api/reports/profit-loss?period=${plPeriod}`).then(r => r.json()),
      ]);

      setSalesData(sales);
      setInventoryData(inventory);
      setTopProductsData(products);
      setProfitLossData(profitLoss);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSalesReportPDF = async () => {
    setExporting('sales-pdf');
    try {
      exportSalesReportToPDF(salesData, salesPeriod);
    } catch (error) {
      alert('Failed to export PDF');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportSalesReportExcel = async () => {
    setExporting('sales-excel');
    try {
      exportSalesReportToExcel(salesData, salesPeriod);
    } catch (error) {
      alert('Failed to export Excel');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportInventoryPDF = async () => {
    setExporting('inventory-pdf');
    try {
      exportInventoryReportToPDF(inventoryData);
    } catch (error) {
      alert('Failed to export PDF');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportInventoryExcel = async () => {
    setExporting('inventory-excel');
    try {
      exportInventoryReportToExcel(inventoryData);
    } catch (error) {
      alert('Failed to export Excel');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPLPDF = async () => {
    setExporting('pl-pdf');
    try {
      exportProfitLossToPDF(profitLossData, plPeriod);
    } catch (error) {
      alert('Failed to export PDF');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPLExcel = async () => {
    setExporting('pl-excel');
    try {
      exportProfitLossToExcel(profitLossData, plPeriod);
    } catch (error) {
      alert('Failed to export Excel');
      console.error(error);
    } finally {
      setExporting(null);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View business insights and performance metrics</p>
      </div>

      {/* Sales Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Summary
            </CardTitle>
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={salesPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSalesPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{salesData?.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold">{salesData?.totalSales}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items Sold</p>
              <p className="text-2xl font-bold">{salesData?.totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Sale</p>
              <p className="text-2xl font-bold">₱{salesData?.averageSale.toFixed(2)}</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSalesReportPDF}
              disabled={exporting === 'sales-pdf'}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === 'sales-pdf' ? 'Exporting...' : 'Export as PDF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSalesReportExcel}
              disabled={exporting === 'sales-excel'}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting === 'sales-excel' ? 'Exporting...' : 'Export as Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Profit & Loss Summary
            </CardTitle>
            <div className="flex gap-2">
              {['week', 'month'].map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={plPeriod === period ? 'default' : 'outline'}
                  onClick={() => setPlPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{profitLossData?.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost</p>
              <p className="text-2xl font-bold text-red-600">₱{profitLossData?.totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gross Profit</p>
              <p className={`text-2xl font-bold ${profitLossData?.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{profitLossData?.grossProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit Margin</p>
              <p className={`text-2xl font-bold ${profitLossData?.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLossData?.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPLPDF}
              disabled={exporting === 'pl-pdf'}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === 'pl-pdf' ? 'Exporting...' : 'Export as PDF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPLExcel}
              disabled={exporting === 'pl-excel'}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting === 'pl-excel' ? 'Exporting...' : 'Export as Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Status
            </CardTitle>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportInventoryPDF}
                disabled={exporting === 'inventory-pdf'}
              >
                <FileText className="mr-2 h-4 w-4" />
                {exporting === 'inventory-pdf' ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportInventoryExcel}
                disabled={exporting === 'inventory-excel'}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting === 'inventory-excel' ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{inventoryData?.totalProducts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{inventoryData?.lowStockCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{inventoryData?.outOfStockCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-blue-600">₱{inventoryData?.totalInventoryValue.toFixed(2)}</p>
            </div>
          </div>

          {inventoryData?.lowStockProducts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-orange-600">Low Stock Alerts</h3>
              <div className="space-y-2">
                {inventoryData.lowStockProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{product.stockLevel} left</p>
                      <p className="text-xs text-gray-500">Reorder: {product.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsData?.topProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topProductsData?.topProducts.map((item: any, index: number) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.totalQuantity} units sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">₱{item.totalRevenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slow Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Slow Moving Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsData?.slowMovingProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">All products moving well</p>
            ) : (
              <div className="space-y-3">
                {topProductsData?.slowMovingProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stock: {product.stockLevel}</p>
                      <p className="text-xs text-orange-600">Low sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}