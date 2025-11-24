import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Edit, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { adminService } from '../../lib/supabaseService';
import type { Profile } from '../../lib/supabaseService';
import { formatINR } from '../../lib/currency';

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(userId: string, currentRole: 'customer' | 'admin') {
    try {
      setUpdating(userId);
      const newRole = currentRole === 'admin' ? 'customer' : 'admin';
      await adminService.updateUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Total Users</p>
          <p className="text-indigo-600" style={{ fontSize: '28px' }}>
            {users.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Customer Users</p>
          <p className="text-green-600" style={{ fontSize: '28px' }}>
            {users.filter((u) => u.role === 'customer').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Admin Users</p>
          <p className="text-purple-600" style={{ fontSize: '28px' }}>
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.full_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.email || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{user.phone_number || 'N/A'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={updating === user.id}
                      className={user.role === 'admin' ? 'text-orange-600 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700'}
                    >
                      {updating === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>{user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}</>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}
