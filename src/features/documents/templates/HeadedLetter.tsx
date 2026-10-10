import { PageFrame } from '@/components/print/PageFrame';
import { Letterhead } from './Letterhead';

/** Headed Letter: full letterhead with What we do, social and hotlines, Our Ref, Your Ref, body, footer We Plan And Do. */
export function HeadedLetter() {
  return (
    <PageFrame size="A4">
      <Letterhead />
      <p className="text-ink-muted">HeadedLetter layout goes here.</p>
    </PageFrame>
  );
}
