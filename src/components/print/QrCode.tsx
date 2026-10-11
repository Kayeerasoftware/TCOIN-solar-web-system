/** Renders a QR code placeholder for an issued document verification URL.
 *  In production, swap the inner div for a real QR library (e.g. qrcode.react). */
export function QrCode({ value, size = 64 }: { value: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center border border-ink bg-white text-[7px] text-ink-muted"
      style={{ width: size, height: size }}
      title={value}
    >
      QR
    </div>
  );
}
