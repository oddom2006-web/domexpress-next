import jsPDF from 'jspdf';
import type { Order } from '@/types';
import { STATUS_LABELS, PAYMENT_LABELS, SERVICE_TYPE_LABELS } from '@/types';
import { fmtDateTime } from './utils';

export function downloadInvoice(order: Order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text('DOM EXPRESS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Logistics Platform', margin, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(240, 165, 0);
  doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });

  y += 42;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  // ── Meta (order id / tracking / date / status) ──
  doc.setFontSize(10);
  const meta: [string, string][] = [
    ['Order ID',    order.orderId],
    ['Tracking ID', order.trackingId],
    ['Date Issued', fmtDateTime(order.createdAt)],
    ['Status',      STATUS_LABELS[order.status] ?? order.status],
  ];
  meta.forEach(([label, val], i) => {
    const rowY = y + i * 16;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label + ':', margin, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(val, margin + 100, rowY);
  });
  y += meta.length * 16 + 28;

  // ── Sender / Receiver ──
  const col2 = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(240, 165, 0);
  doc.text('SENDER', margin, y);
  doc.text('RECEIVER', col2, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(order.senderName || '—', margin, y);
  doc.text(order.receiverName || '—', col2, y);
  y += 15;

  doc.setTextColor(100, 100, 100);
  doc.text(order.branch || '—', margin, y);
  doc.text(order.phone || '—', col2, y);
  y += 15;

  if (order.receiverBranch) { doc.text('', margin, y); doc.text(order.receiverBranch, col2, y); y += 15; }
  if (order.address)        { doc.text('', margin, y); doc.text(order.address, col2, y, { maxWidth: pageWidth/2 - margin - 10 }); y += 15; }

  y += 20;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  // ── Shipment details ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(240, 165, 0);
  doc.text('SHIPMENT DETAILS', margin, y);
  y += 20;

  const details: [string, string][] = [
    ['Package Type',  order.packageType || '—'],
    ['Weight',        `${order.weight} kg`],
    ['Distance',      order.distanceKm != null ? `${order.distanceKm} km` : 'N/A'],
    ['Delivery Type', order.serviceType ? SERVICE_TYPE_LABELS[order.serviceType] : '—'],
  ];
  details.forEach(([label, val], i) => {
    const rowY = y + i * 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(label + ':', margin, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(val, margin + 110, rowY);
  });
  y += details.length * 16 + 30;

  // ── Payment summary box ──
  const boxW = pageWidth - margin * 2;
  const boxH = 90;
  doc.setFillColor(250, 246, 235);
  doc.setDrawColor(240, 165, 0);
  doc.roundedRect(margin, y, boxW, boxH, 6, 6, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Payment Method', margin + 18, y + 24);
  doc.text('Payment Status', margin + 18, y + 46);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] : '—', margin + 130, y + 24);
  if (order.paymentStatus === 'paid') doc.setTextColor(34, 197, 94);
  else doc.setTextColor(245, 158, 11);
  doc.text(order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID', margin + 130, y + 46);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('TOTAL', pageWidth - margin - 18, y + 30, { align: 'right' });
  doc.setFontSize(24);
  doc.setTextColor(240, 165, 0);
  doc.text(order.price != null ? `$${order.price.toFixed(2)}` : '—', pageWidth - margin - 18, y + 60, { align: 'right' });

  y += boxH + 40;

  // ── Footer ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing DOM EXPRESS.', margin, y);
  doc.text('087 327 406 · oddom2022@gmail.com', margin, y + 13);

  doc.save(`Invoice-${order.orderId}.pdf`);
}