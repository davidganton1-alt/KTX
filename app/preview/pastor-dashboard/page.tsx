'use client';

import { RoleDashboard, type RolePersona } from '@/components/design-system/RoleDashboard';

const PASTOR: RolePersona = {
  brandSub: 'Pastor',
  roleSection: 'Ministry',
  peopleLabel: 'Flock',
  name: 'Pastor Sarah Lin',
  org: "Shepherd's Gate Fellowship",
  orgField: 'Ministry / church',
};

export default function PastorDashboardPreview() {
  return <RoleDashboard persona={PASTOR} />;
}
