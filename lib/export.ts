import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// PDF Export Functions

export const exportSalesReportToPDF = (data: any, period: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Palawan State University', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(14);
  doc.text('Sales Summary Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Period: ${period.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  const now = new Date();
  doc.text(`Generated: ${now.toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Summary Section
  doc.setFontSize(12);
  doc.text('Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const summaryData = [
    ['Total Revenue', `₱${data.totalRevenue.toFixed(2)}`],
    ['Total Sales', data.totalSales.toString()],
    ['Items Sold', data.totalItems.toString()],
    ['Average Sale', `₱${data.averageSale.toFixed(2)}`],
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, yPosition);
    doc.text(value, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 6;
  });

  yPosition += 3;

  // Payment Methods Breakdown
  if (data.paymentMethodStats && Object.keys(data.paymentMethodStats).length > 0) {
    doc.setFontSize(12);
    doc.text('Payment Methods', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    Object.entries(data.paymentMethodStats).forEach(([method, stats]: [string, any]) => {
      const percentage = ((stats.revenue / data.totalRevenue) * 100).toFixed(1);
      doc.text(`${method}:`, 25, yPosition);
      doc.text(`${stats.count} sales - ₱${stats.revenue.toFixed(2)} (${percentage}%)`, pageWidth - 40, yPosition, { align: 'right' });
      yPosition += 6;
    });
    yPosition += 3;
  }

  // Sales Details
  if (data.sales && data.sales.length > 0) {
    doc.setFontSize(12);
    doc.text('Sales Details', 20, yPosition);
    yPosition += 8;

    // Table headers
    doc.setFontSize(8);
    const tableLeft = 15;
    const columns = ['Date', 'Receipt #', 'Payment', 'Amount'];
    const columnWidths = [30, 40, 25, 30];

    columns.forEach((col, index) => {
      doc.text(col, tableLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
    });

    yPosition += 5;
    doc.setDrawColor(200);
    doc.line(tableLeft, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    // Table data
    data.sales.slice(0, 20).forEach((sale: any) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      const date = new Date(sale.createdAt).toLocaleDateString();
      const paymentMethod = sale.paymentMethod || 'CASH';
      const values = [
        date,
        sale.saleNumber,
        paymentMethod,
        `₱${sale.netAmount.toFixed(2)}`,
      ];

      values.forEach((val, index) => {
        doc.text(val, tableLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
      });

      yPosition += 5;
    });
  }

  doc.save(`sales-report-${period}-${Date.now()}.pdf`);
};

export const exportInventoryReportToPDF = (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Palawan State University', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(14);
  doc.text('Inventory Status Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  const now = new Date();
  doc.text(`Generated: ${now.toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Summary
  doc.setFontSize(12);
  doc.text('Inventory Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const summaryData = [
    ['Total Products', data.totalProducts.toString()],
    ['Low Stock Items', data.lowStockCount.toString()],
    ['Out of Stock', data.outOfStockCount.toString()],
    ['Total Inventory Value', `₱${data.totalInventoryValue.toFixed(2)}`],
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, yPosition);
    doc.text(value, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 6;
  });

  // Low Stock Products
  if (data.lowStockProducts && data.lowStockProducts.length > 0) {
    yPosition += 5;
    doc.setFontSize(12);
    doc.text('Low Stock Alerts', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    const tableLeft = 20;
    const columns = ['Product', 'Stock', 'Reorder', 'Category'];
    const columnWidths = [50, 20, 20, 40];

    columns.forEach((col, index) => {
      doc.text(col, tableLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
    });

    yPosition += 5;
    doc.setDrawColor(200);
    doc.line(tableLeft, yPosition, pageWidth - 20, yPosition);
    yPosition += 4;

    data.lowStockProducts.slice(0, 10).forEach((product: any) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      const values = [
        product.name.substring(0, 25),
        product.stockLevel.toString(),
        product.reorderLevel.toString(),
        product.category.name,
      ];

      values.forEach((val, index) => {
        doc.text(val, tableLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
      });

      yPosition += 5;
    });
  }

  doc.save(`inventory-report-${Date.now()}.pdf`);
};

export const exportProfitLossToPDF = (data: any, period: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Palawan State University', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(14);
  doc.text('Profit & Loss Statement', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Period: ${period.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  const now = new Date();
  doc.text(`Generated: ${now.toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Revenue', 20, yPosition);
  yPosition += 6;

  doc.setFont(undefined, 'normal');
  doc.text(`Total Sales:`, 30, yPosition);
  doc.text(`₱${data.totalRevenue.toFixed(2)}`, pageWidth - 40, yPosition, { align: 'right' });
  yPosition += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Cost of Goods', 20, yPosition);
  yPosition += 6;

  doc.setFont(undefined, 'normal');
  doc.text(`Total Purchases:`, 30, yPosition);
  doc.text(`₱${data.totalCost.toFixed(2)}`, pageWidth - 40, yPosition, { align: 'right' });
  yPosition += 8;

  doc.setDrawColor(100);
  doc.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);

  doc.setFont(undefined, 'bold');
  doc.text(`Gross Profit:`, 30, yPosition);
  doc.text(`₱${data.grossProfit.toFixed(2)}`, pageWidth - 40, yPosition, { align: 'right' });
  yPosition += 10;

  doc.setFont(undefined, 'normal');
  doc.text(`Profit Margin:`, 30, yPosition);
  doc.text(`${data.profitMargin.toFixed(2)}%`, pageWidth - 40, yPosition, { align: 'right' });
  yPosition += 8;

  doc.setFontSize(9);
  doc.text(`Sales Count: ${data.salesCount}`, 30, yPosition);
  yPosition += 5;
  doc.text(`Purchase Orders: ${data.purchasesCount}`, 30, yPosition);

  doc.save(`profit-loss-${period}-${Date.now()}.pdf`);
};

// Excel Export Functions

export const exportSalesReportToExcel = (data: any, period: string) => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['Palawan State University - Sales Report'],
    [`Period: ${period.toUpperCase()}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Metric', 'Value'],
    ['Total Revenue', `₱${data.totalRevenue.toFixed(2)}`],
    ['Total Sales', data.totalSales],
    ['Items Sold', data.totalItems],
    ['Average Sale', `₱${data.averageSale.toFixed(2)}`],
  ];

  // Add payment method stats
  if (data.paymentMethodStats && Object.keys(data.paymentMethodStats).length > 0) {
    summaryRows.push([]);
    summaryRows.push(['Payment Method', 'Count', 'Revenue', 'Percentage']);
    Object.entries(data.paymentMethodStats).forEach(([method, stats]: [string, any]) => {
      const percentage = ((stats.revenue / data.totalRevenue) * 100).toFixed(1);
      summaryRows.push([method, stats.count, `₱${stats.revenue.toFixed(2)}`, `${percentage}%`]);
    });
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sales Details sheet
  if (data.sales && data.sales.length > 0) {
    const salesData = [
      ['Date', 'Receipt #', 'Cashier', 'Payment Method', 'Amount', 'Items Count'],
      ...data.sales.map((sale: any) => [
        new Date(sale.createdAt).toLocaleString(),
        sale.saleNumber,
        sale.user.fullName,
        sale.paymentMethod || 'CASH',
        sale.netAmount.toFixed(2),
        sale.saleItems.length,
      ]),
    ];

    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    salesSheet['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Details');
  }

  XLSX.writeFile(workbook, `sales-report-${period}-${Date.now()}.xlsx`);
};

export const exportInventoryReportToExcel = (data: any) => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Palawan State University - Inventory Report'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Metric', 'Value'],
    ['Total Products', data.totalProducts],
    ['Low Stock Items', data.lowStockCount],
    ['Out of Stock', data.outOfStockCount],
    ['Total Inventory Value', `₱${data.totalInventoryValue.toFixed(2)}`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Inventory Details sheet
  if (data.allProducts && data.allProducts.length > 0) {
    const inventoryData = [
      ['Product Code', 'Product Name', 'Category', 'Stock Level', 'Reorder Level', 'Unit Price', 'Stock Value'],
      ...data.allProducts.map((product: any) => [
        product.code,
        product.name,
        product.category.name,
        product.stockLevel,
        product.reorderLevel,
        product.unitPrice.toFixed(2),
        (product.stockLevel * product.unitPrice).toFixed(2),
      ]),
    ];

    const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);
    inventorySheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 13 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory');
  }

  // Low Stock sheet
  if (data.lowStockProducts && data.lowStockProducts.length > 0) {
    const lowStockData = [
      ['Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Shortage'],
      ...data.lowStockProducts.map((product: any) => [
        product.name,
        product.category.name,
        product.stockLevel,
        product.reorderLevel,
        product.reorderLevel - product.stockLevel,
      ]),
    ];

    const lowStockSheet = XLSX.utils.aoa_to_sheet(lowStockData);
    lowStockSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 13 }, { wch: 13 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock');
  }

  XLSX.writeFile(workbook, `inventory-report-${Date.now()}.xlsx`);
};

export const exportProfitLossToExcel = (data: any, period: string) => {
  const workbook = XLSX.utils.book_new();

  const plData = [
    ['Palawan State University - Profit & Loss Statement'],
    [`Period: ${period.toUpperCase()}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Revenue', data.totalRevenue.toFixed(2)],
    ['Cost of Goods', data.totalCost.toFixed(2)],
    ['Gross Profit', data.grossProfit.toFixed(2)],
    [],
    ['Profit Margin (%)', data.profitMargin.toFixed(2)],
    ['Sales Count', data.salesCount],
    ['Purchase Orders', data.purchasesCount],
  ];

  const plSheet = XLSX.utils.aoa_to_sheet(plData);
  plSheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, plSheet, 'P&L Statement');

  XLSX.writeFile(workbook, `profit-loss-${period}-${Date.now()}.xlsx`);
};
