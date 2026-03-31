import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClients';
import { useCanEdit, useCanDelete } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';
import { ClientFormComponent } from '../forms/ServiceForm';
import { TableSkeleton } from '../components/Skeleton';

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useClients(page, 10, search);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const canEdit = useCanEdit();
  const canDelete = useCanDelete();
  const { addToast } = useToast();

  const handleCreate = async (formData: any) => {
    try {
      await createMutation.mutateAsync(formData);
      addToast('Client created successfully', 'success');
      setIsModalOpen(false);
    } catch (error) {
      addToast('Failed to create client', 'error');
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: formData,
      });
      addToast('Client updated successfully', 'success');
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      addToast('Failed to update client', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      addToast('Client deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete client', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        {canEdit && (
          <button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Client
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : null}

      {data && !isLoading && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingId(client.id);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(client.id)}
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
              Page {page} of {Math.ceil(data.total / 10)} ({data.total} total)
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
                onClick={() => setPage(Math.min(Math.ceil(data.total / 10), page + 1))}
                disabled={page >= Math.ceil(data.total / 10)}
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
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Client' : 'New Client'}</h2>
            <ClientFormComponent
              onSubmit={editingId ? handleUpdate : handleCreate}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
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
