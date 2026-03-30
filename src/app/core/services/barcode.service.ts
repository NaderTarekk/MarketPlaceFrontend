import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  /** Renders a QR code onto the given canvas element. */
  renderToCanvas(canvas: HTMLCanvasElement, value: string, options?: {
    size?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }): void {
    QRCode.toCanvas(canvas, value, {
      width: options?.size ?? 200,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.darkColor ?? '#000000',
        light: options?.lightColor ?? '#FFFFFF'
      }
    });
  }

  /** Returns a PNG data URL for the given QR code value. */
  toDataURL(value: string, size = 200): Promise<string> {
    return QRCode.toDataURL(value, { width: size, margin: 2 });
  }

  /** Triggers a PNG download of the QR code. */
  downloadAsPng(value: string, filename?: string): void {
    QRCode.toDataURL(value, { width: 400, margin: 2 }).then(dataUrl => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename ?? `${value}.png`;
      link.click();
    });
  }

  /** Generates a print-ready PDF using html2pdf.js with logo, employee name, order number. */
  downloadAsPdf(options: {
    barcodeValue: string;
    orderNumber: string;
    customerName?: string;
    employeeName?: string;
    logoUrl?: string;
    filename?: string;
  }): void {
    QRCode.toDataURL(options.barcodeValue, { width: 240, margin: 2 }).then(qrDataUrl => {
      const logoHtml = options.logoUrl
        ? `<img src="${options.logoUrl}" style="height:50px;margin-bottom:8px;" />`
        : `<div style="font-size:22px;font-weight:900;color:#7c3aed;letter-spacing:2px;margin-bottom:8px;">NOQTA</div>`;

      const customerLine = options.customerName
        ? `<div style="font-size:12px;color:#374151;margin-top:6px;">العميل / Customer: <strong>${options.customerName}</strong></div>`
        : '';

      const employeeLine = options.employeeName
        ? `<div style="font-size:11px;color:#666;margin-top:4px;">موظف الشحن: <strong>${options.employeeName}</strong></div>`
        : '';

      const html = `
        <div style="font-family:Arial,sans-serif;text-align:center;padding:24px;width:320px;border:1px solid #e5e7eb;border-radius:8px;">
          ${logoHtml}
          <div style="font-size:13px;color:#374151;font-weight:600;margin-bottom:4px;">رقم الطلب / Order No.</div>
          <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:12px;">${options.orderNumber}</div>
          <img src="${qrDataUrl}" style="width:200px;height:200px;margin-bottom:8px;" />
          <div style="font-size:12px;color:#6b7280;letter-spacing:1px;">${options.barcodeValue}</div>
          ${customerLine}
          ${employeeLine}
        </div>`;

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const html2pdf = (window as any)['html2pdf'];
      const runPdf = (fn: any) => fn()
        .set({
          margin: 5,
          filename: options.filename ?? `${options.orderNumber}-qr.pdf`,
          image: { type: 'png', quality: 1 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
        })
        .from(container.firstElementChild)
        .save()
        .then(() => document.body.removeChild(container));

      if (html2pdf) {
        runPdf(html2pdf);
      } else {
        import('html2pdf.js').then((mod: any) => runPdf(mod.default ?? mod));
      }
    });
  }
}
