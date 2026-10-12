export function Logo({ small = false, className = '' }: { small?: boolean; className?: string }) {
  return (
    <img
      src="/brand/TCOIN LOGO OFFICIAL.svg"
      alt="TCOIN We Plan and Do"
      className={`${small ? 'h-10' : 'h-14'} w-auto ${className}`}
    />
  );
}
