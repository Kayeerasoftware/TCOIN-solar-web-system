export function Logo({ small = false, className = '' }: { small?: boolean; className?: string }) {
  return <img src={small ? '/brand/logo-small.png' : '/brand/logo.png'} alt="TCOIN We Plan and Do" className={`h-10 w-auto ${className}`} />;
}
