import QRCode from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.trustthelocal.com";

/**
 * Generate a QR code URL for a shop.
 */
export function getShopQrUrl(shopQrCodeId: string): string {
  return `${APP_URL}/?ref=${shopQrCodeId}`;
}

/**
 * Generate QR code as PNG buffer (high resolution for print).
 * Suitable for plexiglass printing.
 */
export async function generateQrPng(shopQrCodeId: string): Promise<Buffer> {
  const url = getShopQrUrl(shopQrCodeId);
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 1024,
    margin: 2,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  return buffer;
}

/**
 * Generate QR code as SVG string (scalable for any size).
 */
export async function generateQrSvg(shopQrCodeId: string): Promise<string> {
  const url = getShopQrUrl(shopQrCodeId);
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  return svg;
}

/**
 * Generate QR code as Data URL (for web preview).
 */
export async function generateQrDataUrl(shopQrCodeId: string): Promise<string> {
  const url = getShopQrUrl(shopQrCodeId);
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}
