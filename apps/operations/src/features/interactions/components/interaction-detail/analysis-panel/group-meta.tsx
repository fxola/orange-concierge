import type { ReactNode } from 'react';
import { Compass, KeyRound, ShieldCheck } from 'lucide-react';
import type { FactGroupKey } from './types';

export type FactGroupMeta = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}>;

export const GROUP_META: Record<FactGroupKey, FactGroupMeta> = {
  custody: {
    eyebrow: 'Client assets',
    title: 'Custody',
    description: 'How the client stores assets and what worries them.',
    icon: <KeyRound size={15} strokeWidth={1.8} />,
  },
  cybersecurity: {
    eyebrow: 'Controls and risks',
    title: 'Cybersecurity',
    description: 'Security controls, known risks, and incident history.',
    icon: <ShieldCheck size={15} strokeWidth={1.8} />,
  },
  planning: {
    eyebrow: 'Next actions',
    title: 'Planning',
    description: 'Goals, constraints, and follow-up items.',
    icon: <Compass size={15} strokeWidth={1.8} />,
  },
};
