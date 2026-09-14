'use client';

import { RoleDashboard, type RolePersona } from '@/components/design-system/RoleDashboard';

const CREATOR: RolePersona = {
  brandSub: 'Creator',
  roleSection: 'Network',
  peopleLabel: 'Community',
  name: 'Marcus Ade',
  org: 'Kingdom Finance Lab',
  orgField: 'Brand',
};

export default function CreatorDashboardPreview() {
  return <RoleDashboard persona={CREATOR} />;
}
