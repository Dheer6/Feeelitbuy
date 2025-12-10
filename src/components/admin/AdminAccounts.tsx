import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  Search,
  FileText,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  reference?: string;
  account: string;
}

interface AccountSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
  operatingExpenses: number;
  cashInHand: number;
  accountsReceivable: number;
  accountsPayable: number;
}

interface LedgerEntry {
  id: string;
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
}

export function AdminAccounts() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'balance-sheet' | 'profit-loss' | 'ledger'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    cashInHand: 0,
    accountsReceivable: 0,
    accountsPayable: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assets: true,
    liabilities: true,
    equity: true
  });

  useEffect(() => {
    loadAccountsData();
  }, [dateRange]);

  const loadAccountsData = async () => {
    try {
      setLoading(true);
      
      // Load orders for revenue calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate revenue from orders
      const revenue = orders?.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + (order.total || 0);
        }
        return sum;
      }, 0) || 0;

      // Calculate cost of goods sold (assuming 60% margin)
      const cogs = revenue * 0.4;
      const grossProfit = revenue - cogs;

      // Mock operating expenses (you can replace with actual data)
      const operatingExpenses = revenue * 0.2;
      const netProfit = grossProfit - operatingExpenses;

      // Mock cash and receivables
      const cashInHand = revenue * 0.3;
      const accountsReceivable = revenue * 0.15;
      const accountsPayable = revenue * 0.1;

      setAccountSummary({
        totalRevenue: revenue,
        totalExpenses: cogs + operatingExpenses,
        netProfit,
        grossProfit,
        operatingExpenses,
        cashInHand,
        accountsReceivable,
        accountsPayable
      });

      // Generate transaction history from orders
      const transactionsList: Transaction[] = orders?.map((order: any) => ({
        id: order.id,
        date: order.created_at,
        type: 'income' as const,
        category: 'Sales Revenue',
        description: `Order #${order.id.slice(0, 8)} - ${order.status}`,
        amount: order.total || 0,
        reference: order.id,
        account: 'Sales'
      })) || [];

      setTransactions(transactionsList);

      // Generate ledger entries
      let runningBalance = 0;
      const ledger: LedgerEntry[] = transactionsList
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((txn) => {
          const debit = txn.type === 'income' ? txn.amount : 0;
          const credit = txn.type === 'expense' ? txn.amount : 0;
          runningBalance += debit - credit;
          
          return {
            id: txn.id,
            date: txn.date,
            particulars: txn.description,
            debit,
            credit,
            balance: runningBalance,
            category: txn.category
          };
        });

      setLedgerEntries(ledger);

    } catch (error) {
      console.error('Error loading accounts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || txn.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounts & Finance</h2>
          <p className="text-gray-600 mt-1">Manage financial records, statements, and reports</p>
        </div>
        <Button onClick={() => exportToCSV(transactions, 'financial-records')}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Revenue</p>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{accountSummary.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600">From all sales</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Expenses</p>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-red-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{accountSummary.totalExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600">COGS + Operating</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Net Profit</p>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{accountSummary.netProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600">
            {((accountSummary.netProfit / accountSummary.totalRevenue) * 100).toFixed(1)}% margin
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Cash in Hand</p>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-purple-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{accountSummary.cashInHand.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600">Available balance</p>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'balance-sheet' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('balance-sheet')}
            className="flex-1"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Balance Sheet
          </Button>
          <Button
            variant={activeTab === 'profit-loss' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profit-loss')}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            P&L Statement
          </Button>
          <Button
            variant={activeTab === 'ledger' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ledger')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ledger
          </Button>
        </div>
      </Card>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Date Range</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label>Search Transactions</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label>Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Account</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 20).map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm">
                        {new Date(txn.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{txn.description}</p>
                        {txn.reference && (
                          <p className="text-sm text-gray-600">Ref: {txn.reference.slice(0, 8)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{txn.category}</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm">{txn.account}</td>
                      <td className="py-4 px-4 text-right font-semibold">
                        <span className={txn.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {txn.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600 inline" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Balance Sheet Tab */}
      {activeTab === 'balance-sheet' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Balance Sheet</h3>
            <p className="text-sm text-gray-600">As of {new Date().toLocaleDateString('en-IN')}</p>
          </div>

          <div className="space-y-6">
            {/* Assets */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer py-3 border-b-2 border-blue-600"
                onClick={() => toggleSection('assets')}
              >
                <h4 className="text-lg font-semibold text-blue-600">ASSETS</h4>
                {expandedSections.assets ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.assets && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                    <span className="text-gray-700">Cash in Hand</span>
                    <span className="font-semibold">₹{accountSummary.cashInHand.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                    <span className="text-gray-700">Accounts Receivable</span>
                    <span className="font-semibold">₹{accountSummary.accountsReceivable.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 bg-blue-50 font-bold">
                    <span>Total Assets</span>
                    <span>₹{(accountSummary.cashInHand + accountSummary.accountsReceivable).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Liabilities */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer py-3 border-b-2 border-red-600"
                onClick={() => toggleSection('liabilities')}
              >
                <h4 className="text-lg font-semibold text-red-600">LIABILITIES</h4>
                {expandedSections.liabilities ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.liabilities && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                    <span className="text-gray-700">Accounts Payable</span>
                    <span className="font-semibold">₹{accountSummary.accountsPayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 bg-red-50 font-bold">
                    <span>Total Liabilities</span>
                    <span>₹{accountSummary.accountsPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Equity */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer py-3 border-b-2 border-green-600"
                onClick={() => toggleSection('equity')}
              >
                <h4 className="text-lg font-semibold text-green-600">EQUITY</h4>
                {expandedSections.equity ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.equity && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                    <span className="text-gray-700">Retained Earnings</span>
                    <span className="font-semibold">₹{accountSummary.netProfit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 px-4 bg-green-50 font-bold">
                    <span>Total Equity</span>
                    <span>₹{accountSummary.netProfit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Check */}
            <div className="mt-6 pt-6 border-t-2">
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                <span className="text-lg font-bold">Assets = Liabilities + Equity</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{(accountSummary.cashInHand + accountSummary.accountsReceivable).toLocaleString('en-IN')} = 
                  ₹{(accountSummary.accountsPayable + accountSummary.netProfit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Profit & Loss Tab */}
      {activeTab === 'profit-loss' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Profit & Loss Statement</h3>
            <p className="text-sm text-gray-600">For the period ending {new Date().toLocaleDateString('en-IN')}</p>
          </div>

          <div className="space-y-6">
            {/* Revenue */}
            <div>
              <h4 className="text-lg font-semibold text-green-600 pb-3 border-b-2 border-green-600 mb-4">REVENUE</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700">Sales Revenue</span>
                  <span className="font-semibold">₹{accountSummary.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 px-4 bg-green-50 font-bold">
                  <span>Total Revenue</span>
                  <span>₹{accountSummary.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <h4 className="text-lg font-semibold text-orange-600 pb-3 border-b-2 border-orange-600 mb-4">COST OF GOODS SOLD</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700">Product Costs</span>
                  <span className="font-semibold">₹{(accountSummary.totalRevenue * 0.4).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 px-4 bg-orange-50 font-bold">
                  <span>Total COGS</span>
                  <span>₹{(accountSummary.totalRevenue * 0.4).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between py-3 px-4 bg-blue-100 rounded-lg font-bold text-lg">
              <span>Gross Profit</span>
              <span className="text-blue-600">₹{accountSummary.grossProfit.toLocaleString('en-IN')}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <h4 className="text-lg font-semibold text-red-600 pb-3 border-b-2 border-red-600 mb-4">OPERATING EXPENSES</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700">Marketing & Sales</span>
                  <span className="font-semibold">₹{(accountSummary.operatingExpenses * 0.5).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700">Administrative</span>
                  <span className="font-semibold">₹{(accountSummary.operatingExpenses * 0.3).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 px-4 hover:bg-gray-50">
                  <span className="text-gray-700">Technology & Infrastructure</span>
                  <span className="font-semibold">₹{(accountSummary.operatingExpenses * 0.2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 px-4 bg-red-50 font-bold">
                  <span>Total Operating Expenses</span>
                  <span>₹{accountSummary.operatingExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="flex justify-between py-4 px-6 bg-gradient-to-r from-green-100 to-green-200 rounded-lg font-bold text-xl border-2 border-green-600">
              <span>NET PROFIT</span>
              <span className="text-green-700">₹{accountSummary.netProfit.toLocaleString('en-IN')}</span>
            </div>

            {/* Profit Margin */}
            <div className="flex justify-between py-3 px-4 bg-gray-100 rounded-lg">
              <span className="font-semibold">Profit Margin</span>
              <span className="font-bold text-green-600">
                {((accountSummary.netProfit / accountSummary.totalRevenue) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Ledger Tab */}
      {activeTab === 'ledger' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">General Ledger</h3>
            <Button onClick={() => exportToCSV(ledgerEntries, 'ledger')}>
              <Download className="w-4 h-4 mr-2" />
              Export Ledger
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Particulars</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Debit (₹)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Credit (₹)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {new Date(entry.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{entry.particulars}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {entry.debit > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {entry.debit.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {entry.credit > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {entry.credit.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {entry.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-100">
                  <td colSpan={3} className="py-4 px-4 font-bold">CLOSING BALANCE</td>
                  <td className="py-4 px-4 text-right font-bold text-green-600">
                    {ledgerEntries.reduce((sum, e) => sum + e.debit, 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-red-600">
                    {ledgerEntries.reduce((sum, e) => sum + e.credit, 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-blue-600">
                    {ledgerEntries[ledgerEntries.length - 1]?.balance.toLocaleString('en-IN') || '0'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
