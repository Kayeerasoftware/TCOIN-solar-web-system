// Renders the verification QR for an issued document. Add a QR library (for example qrcode) and encode `${origin}/verify/${code}`.
export function QrCode({ code }: { code: string }) {
  return <div className="flex h-16 w-16 items-center justify-center border text-[8px]">QR {code}</div>;
}
