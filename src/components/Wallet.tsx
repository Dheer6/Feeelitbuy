import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, Gift, Copy, Check, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { formatINR } from '../lib/currency';
import { walletService, referralService } from '../lib/supabaseService';

interface WalletProps {
  onBack: () => void;
}

export function Wallet({ onBack }: WalletProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCodeInput, setApplyCodeInput] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, txns, refCode, refs] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
        referralService.generateCode(),
        referralService.getMyReferrals(),
      ]);
      setWallet(walletData);
      setTransactions(txns);
      setReferralCode(refCode);
      setReferrals(refs);
    } catch (err) {
      console.error('Error loading wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralCode = () => {
    if (referralCode) {
      const text = `Join Feel It Buy using my referral code ${referralCode.code} and get ₹50 bonus! 🎁`;
      const url = `${window.location.origin}?ref=${referralCode.code}`;
      
      if (navigator.share) {
        navigator.share({ title: 'Join Feel It Buy', text, url });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      }
    }
  };

  const applyReferralCode = async () => {
    if (!applyCodeInput.trim()) return;
    
    setApplyingCode(true);
    try {
      await referralService.applyReferralCode(applyCodeInput.trim().toUpperCase());
      alert('Referral code applied successfully! You\'ll receive ₹50 bonus after your first purchase.');
      setApplyCodeInput('');
      loadWalletData();
    } catch (err: any) {
      alert(err.message || 'Failed to apply referral code');
    } finally {
      setApplyingCode(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'referral_bonus': return <Gift className="w-5 h-5 text-green-600" />;
      case 'reward': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'debit': return <WalletIcon className="w-5 h-5 text-red-600" />;
      default: return <WalletIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total Balance</span>
            <WalletIcon className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">{formatINR(wallet?.balance || 0)}</div>
          <p className="text-xs opacity-75 mt-2">Available for use</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Referral Earnings</span>
            <Gift className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">{formatINR(wallet?.referral_amount || 0)}</div>
          <p className="text-xs opacity-75 mt-2">From {referrals.length} referrals</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Rewards</span>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">{formatINR(wallet?.reward_amount || 0)}</div>
          <p className="text-xs opacity-75 mt-2">Cashback & bonuses</p>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="referral">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(txn.type)}
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(txn.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? '+' : ''}{formatINR(txn.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="mt-6">
          <div className="space-y-6">
            {/* My Referral Code */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
              <div className="bg-gray-50 p-6 rounded-lg text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Share this code with friends</p>
                <div className="text-3xl font-bold text-orange-600 mb-4 tracking-wider">
                  {referralCode?.code}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={copyReferralCode} variant="outline" className="gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button onClick={shareReferralCode} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Share2 className="w-4 h-4" />
                    Share via WhatsApp
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">₹100</p>
                  <p className="text-sm text-gray-600">You earn per referral</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">₹50</p>
                  <p className="text-sm text-gray-600">Your friend gets</p>
                </div>
              </div>
            </Card>

            {/* Apply Referral Code */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Have a Referral Code?</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={applyCodeInput}
                  onChange={(e) => setApplyCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className="flex-1 px-4 py-2 border rounded-lg"
                  disabled={applyingCode}
                />
                <Button 
                  onClick={applyReferralCode} 
                  disabled={applyingCode || !applyCodeInput.trim()}
                >
                  {applyingCode ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Get ₹50 bonus when you make your first purchase!
              </p>
            </Card>

            {/* My Referrals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">My Referrals ({referrals.length})</h3>
              {referrals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No referrals yet. Start sharing your code!
                </p>
              ) : (
                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{ref.profiles?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(ref.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          ref.status === 'rewarded' 
                            ? 'bg-green-100 text-green-700' 
                            : ref.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ref.status}
                        </span>
                        {ref.status === 'rewarded' && (
                          <p className="text-sm text-green-600 mt-1 font-semibold">
                            +{formatINR(ref.referrer_reward)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
