import QRCode from "qrcode";

export async function buildVerificationQrDataUrl(input: {
  url: string;
  width?: number;
  margin?: number;
}) {
  return QRCode.toDataURL(input.url, {
    width: input.width ?? 180,
    margin: input.margin ?? 1,
  });
}
