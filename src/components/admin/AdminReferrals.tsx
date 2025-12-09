import { useState, useEffect } from 'react';
import { Users, Gift, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_amount: number;
  reward_credited: boolean;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  referrer_email?: string;
  referee_email?: string;
}

interface ReferralStats {
  total: number;
  pending: number;
  completed: number;
  expired: number;
  totalRewards: number;
  creditedRewards: number;
}

export function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    pending: 0,
    completed: 0,
    expired: 0,
    totalRewards: 0,
    creditedRewards: 0,
  });

  useEffect(() => {
    loadReferrals();
  }, []);

  useEffect(() => {
    filterReferrals();
  }, [referrals, searchTerm, statusFilter]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:referrer_id(email),
          referee:referee_id(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referralsWithEmails = (data || []).map((ref: any) => ({
        ...ref,
        referrer_email: ref.referrer?.email || 'Unknown',
        referee_email: ref.referee?.email || 'Unknown',
      }));

      setReferrals(referralsWithEmails);
      calculateStats(referralsWithEmails);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Referral[]) => {
    const stats: ReferralStats = {
      total: data.length,
      pending: data.filter((r) => r.status === 'pending').length,
      completed: data.filter((r) => r.status === 'completed').length,
      expired: data.filter((r) => r.status === 'expired').length,
      totalRewards: data.reduce((sum, r) => sum + r.reward_amount, 0),
      creditedRewards: data
        .filter((r) => r.reward_credited)
        .reduce((sum, r) => sum + r.reward_amount, 0),
    };
    setStats(stats);
  };

  const filterReferrals = () => {
    let filtered = referrals;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.referral_code.toLowerCase().includes(term) ||
          r.referrer_email?.toLowerCase().includes(term) ||
          r.referee_email?.toLowerCase().includes(term)
      );
    }

    setFilteredReferrals(filtered);
  };

  const handleCreditReward = async (referral: Referral) => {
    if (!confirm(`Credit ₹${referral.reward_amount} reward to ${referral.referrer_email}?`)) return;

    try {
      const { error } = await supabase
        .from('referrals')
        .update({ reward_credited: true })
        .eq('id', referral.id);

      if (error) throw error;

      // Also update wallet balance
      const { error: walletError } = await supabase.rpc('add_wallet_balance', {
        user_id: referral.referrer_id,
        amount: referral.reward_amount,
      });

      if (walletError) throw walletError;

      alert('Reward credited successfully!');
      loadReferrals();
    } catch (error) {
      console.error('Failed to credit reward:', error);
      alert('Failed to credit reward');
    }
  };

  const handleUpdateStatus = async (referral: Referral, newStatus: 'pending' | 'completed' | 'expired') => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed' && !referral.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('referrals')
        .update(updateData)
        .eq('id', referral.id);

      if (error) throw error;
      loadReferrals();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update referral status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Referral Management</h2>
        <p className="text-gray-600">Manage customer referrals and rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Referrals</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Rewards</div>
          <div className="text-2xl font-bold">₹{stats.totalRewards}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Credited</div>
          <div className="text-2xl font-bold text-green-600">₹{stats.creditedRewards}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by code or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referrals Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm">{referral.referral_code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{referral.referrer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{referral.referee_email || 'Not joined'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">₹{referral.reward_amount}</span>
                      {referral.reward_credited && (
                        <Badge variant="outline" className="text-green-600">
                          Credited
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(referral.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {referral.status === 'completed' && !referral.reward_credited && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreditReward(referral)}
                          className="text-green-600"
                        >
                          <Gift className="w-4 h-4 mr-1" />
                          Credit
                        </Button>
                      )}
                      {referral.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(referral, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(referral, 'expired')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredReferrals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No referrals found</p>
        </div>
      )}
    </div>
  );
}
