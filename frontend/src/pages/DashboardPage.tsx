import { useDashboardMetrics } from '../hooks/useServices';
import { CardSkeleton } from '../components/Skeleton';

export function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <CardSkeleton />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalClients}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Services</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalServices}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">${metrics.totalRevenue?.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Completed Services</p>
              <p className="text-3xl font-bold text-green-600">{metrics.servicesByStatus.completed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Services by Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-lg font-bold text-yellow-600">{metrics.servicesByStatus.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <span className="text-lg font-bold text-blue-600">{metrics.servicesByStatus.in_progress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-green-600">{metrics.servicesByStatus.completed}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Completion Rate:{' '}
                  <span className="font-bold text-gray-900">
                    {metrics.totalServices > 0
                      ? Math.round((metrics.servicesByStatus.completed / metrics.totalServices) * 100)
                      : 0}
                    %
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Average Service Value:{' '}
                  <span className="font-bold text-gray-900">
                    ${metrics.totalServices > 0 ? Math.round(metrics.totalRevenue / metrics.totalServices) : 0}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Active Services:{' '}
                  <span className="font-bold text-gray-900">
                    {metrics.servicesByStatus.pending + metrics.servicesByStatus.in_progress}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Client Base:{' '}
                  <span className="font-bold text-gray-900">{metrics.totalClients}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
