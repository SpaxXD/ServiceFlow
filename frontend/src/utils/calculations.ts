export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function calculateAverageServiceValue(totalRevenue: number, totalServices: number): number {
  if (totalServices === 0) return 0;
  return Math.round(totalRevenue / totalServices);
}

export function getServiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return labels[status] || status;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    user: 'User',
  };
  return labels[role] || role;
}
