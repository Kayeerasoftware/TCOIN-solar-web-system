/** The red and green rule that sits under every TCOIN letterhead. */
export function DoubleRule() {
  return (
    <div aria-hidden="true">
      <div className="h-[5px] bg-brand-red" />
      <div className="h-[4px] bg-brand-green" />
    </div>
  );
}
