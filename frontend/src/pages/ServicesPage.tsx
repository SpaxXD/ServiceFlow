import { useServices, useCreateService, useUpdateService, useDeleteService } from '../hooks/useServices';
import { useClients } from '../hooks/useClients';
import { useCanEdit, useCanDelete } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';
import { TableSkeleton } from '../components/Skeleton';

const SERVICE_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export function ServicesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ clientId: '', title: '', description: '', value: 0 });

  const { data: services, isLoading } = useServices(page, 10, {
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const { data: clientsData } = useClients(1, 100);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const canEdit = useCanEdit();
  const canDelete = useCanDelete();
  const { addToast } = useToast();

  const handleCreate = async () => {
    if (!formData.clientId || !formData.title || !formData.value) {
      addToast('Please fill all fields', 'error');
      return;
    }

    try {
      await createMutation.mutateAsync(formData as any);
      addToast('Service created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ clientId: '', title: '', description: '', value: 0 });
    } catch (error) {
      addToast('Failed to create service', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.title || !formData.value) {
      addToast('Please fill all fields', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: { title: formData.title, description: formData.description, value: formData.value },
      });
      addToast('Service updated successfully', 'success');
      setIsModalOpen(false);
      setFormData({ clientId: '', title: '', description: '', value: 0 });
      setEditingId(null);
    } catch (error) {
      addToast('Failed to update service', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      addToast('Service deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete service', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        {canEdit && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ clientId: '', title: '', description: '', value: 0 });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Service
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : null}

      {services && !isLoading && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.data.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${service.value?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          SERVICE_STATUS_COLORS[service.status as keyof typeof SERVICE_STATUS_COLORS]
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingId(service.id);
                              setFormData({
                                clientId: service.clientId,
                                title: service.title,
                                description: service.description,
                                value: service.value,
                              });
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {page} of {Math.ceil(services.total / 10)} ({services.total} total)
            </p>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(Math.ceil(services.total / 10), page + 1))}
                disabled={page >= Math.ceil(services.total / 10)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Service' : 'New Service'}</h2>
            <div className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clientsData?.data.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
              }}
              className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
