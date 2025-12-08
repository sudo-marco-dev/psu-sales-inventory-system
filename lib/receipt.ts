import jsPDF from 'jspdf';

export const generateReceiptPDF = (sale: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200], // Receipt size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;

  // Center text helper
  const centerText = (text: string, y: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };

  const leftText = (text: string, y: number, fontSize: number = 10, x: number = 5) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
  };

  const rightText = (text: string, y: number, fontSize: number = 10, x: number = pageWidth - 5) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { align: 'right' });
  };

  // Header
  centerText('Palawan State University', yPosition, 11);
  yPosition += 6;
  centerText('Sales Receipt', yPosition, 10);
  yPosition += 8;

  // Receipt info
  doc.setFontSize(9);
  leftText(`Receipt #: ${sale.saleNumber}`, yPosition);
  yPosition += 5;

  const date = new Date(sale.createdAt).toLocaleString();
  leftText(`Date: ${date}`, yPosition);
  yPosition += 5;

  leftText(`Cashier: ${sale.user.fullName}`, yPosition);
  yPosition += 7;

  // Separator
  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 5;

  // Items Header
  doc.setFont(undefined, 'bold');
  doc.setFontSize(8);
  leftText('Item', yPosition);
  leftText('Qty', yPosition, 8, pageWidth / 2 - 5);
  rightText('Total', yPosition, 8);
  yPosition += 4;

  doc.setDrawColor(200);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 4;

  // Items
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);

  sale.saleItems.forEach((item: any) => {
    const itemName = item.product.name.substring(0, 20);
    const itemPrice = item.unitPrice.toFixed(2);
    const qty = item.quantity.toString();
    const subtotal = item.subtotal.toFixed(2);

    leftText(`${itemName}`, yPosition);
    yPosition += 3;

    doc.setFontSize(7);
    leftText(`@ ₱${itemPrice}`, yPosition);
    leftText(`x${qty}`, yPosition, 7, pageWidth / 2 - 5);
    rightText(`₱${subtotal}`, yPosition, 7);
    yPosition += 4;
  });

  // Separator
  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 4;

  // Total section
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  const subtotal = sale.saleItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  leftText('Subtotal:', yPosition);
  rightText(`₱${subtotal.toFixed(2)}`, yPosition);
  yPosition += 5;

  if (sale.taxAmount > 0) {
    leftText('Tax:', yPosition);
    rightText(`₱${sale.taxAmount.toFixed(2)}`, yPosition);
    yPosition += 5;
  }

  // Total with bold
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  leftText('TOTAL:', yPosition);
  rightText(`₱${sale.netAmount.toFixed(2)}`, yPosition);
  yPosition += 7;

  // Separator
  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 5;

  // Footer
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  centerText('Thank you for your purchase!', yPosition);
  yPosition += 4;
  centerText('Please keep this receipt for your records', yPosition);
  yPosition += 6;

  const timestamp = new Date().getTime();
  centerText(`${timestamp}`, yPosition, 7);

  // Save
  doc.save(`receipt-${sale.saleNumber}.pdf`);
};

export const printReceiptDirect = (sale: any) => {
  // Open receipt in new window for printing
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 10;

  const centerText = (text: string, y: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };

  const leftText = (text: string, y: number, fontSize: number = 10, x: number = 5) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
  };

  const rightText = (text: string, y: number, fontSize: number = 10, x: number = pageWidth - 5) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { align: 'right' });
  };

  // Header
  centerText('Palawan State University', yPosition, 11);
  yPosition += 6;
  centerText('Sales Receipt', yPosition, 10);
  yPosition += 8;

  doc.setFontSize(9);
  leftText(`Receipt #: ${sale.saleNumber}`, yPosition);
  yPosition += 5;

  const date = new Date(sale.createdAt).toLocaleString();
  leftText(`Date: ${date}`, yPosition);
  yPosition += 5;

  leftText(`Cashier: ${sale.user.fullName}`, yPosition);
  yPosition += 7;

  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 5;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(8);
  leftText('Item', yPosition);
  leftText('Qty', yPosition, 8, pageWidth / 2 - 5);
  rightText('Total', yPosition, 8);
  yPosition += 4;

  doc.setDrawColor(200);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 4;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);

  sale.saleItems.forEach((item: any) => {
    const itemName = item.product.name.substring(0, 20);
    const itemPrice = item.unitPrice.toFixed(2);
    const qty = item.quantity.toString();
    const subtotal = item.subtotal.toFixed(2);

    leftText(`${itemName}`, yPosition);
    yPosition += 3;

    doc.setFontSize(7);
    leftText(`@ ₱${itemPrice}`, yPosition);
    leftText(`x${qty}`, yPosition, 7, pageWidth / 2 - 5);
    rightText(`₱${subtotal}`, yPosition, 7);
    yPosition += 4;
  });

  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 4;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  const subtotal = sale.saleItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  leftText('Subtotal:', yPosition);
  rightText(`₱${subtotal.toFixed(2)}`, yPosition);
  yPosition += 5;

  if (sale.taxAmount > 0) {
    leftText('Tax:', yPosition);
    rightText(`₱${sale.taxAmount.toFixed(2)}`, yPosition);
    yPosition += 5;
  }

  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  leftText('TOTAL:', yPosition);
  rightText(`₱${sale.netAmount.toFixed(2)}`, yPosition);
  yPosition += 7;

  doc.setDrawColor(0);
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  centerText('Thank you for your purchase!', yPosition);
  yPosition += 4;
  centerText('Please keep this receipt for your records', yPosition);

  // Open in new window for printing
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 250);
    };
  }
};
