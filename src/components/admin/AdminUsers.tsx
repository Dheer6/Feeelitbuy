import { useState } from 'react';
import { Search, UserCheck, UserX, Edit } from 'lucide-react';
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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 3450.0,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      role: 'user',
      status: 'active',
      joinDate: '2024-02-20',
      totalOrders: 8,
      totalSpent: 2100.0,
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@feelitbuy.com',
      phone: '+1234567892',
      role: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      totalOrders: 0,
      totalSpent: 0,
    },
    {
      id: '4',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567893',
      role: 'user',
      status: 'active',
      joinDate: '2024-03-10',
      totalOrders: 5,
      totalSpent: 1250.0,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <p className="text-gray-600 mb-2">Active Users</p>
          <p className="text-green-600" style={{ fontSize: '28px' }}>
            {users.filter((u) => u.status === 'active').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Blocked Users</p>
          <p className="text-red-600" style={{ fontSize: '28px' }}>
            {users.filter((u) => u.status === 'blocked').length}
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
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
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
                    {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{user.totalOrders}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-indigo-600">${user.totalSpent.toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {user.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
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
