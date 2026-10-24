import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { Transaction } from './types';

// Page Imports
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FraudAnalyticsPage } from './pages/FraudAnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { AssistantPage } from './pages/AssistantPage';
import { MLOpsPage } from './pages/MLOpsPage';
import { AdminRulesPage } from './pages/AdminRulesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// New Entity Profile Pages
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { MerchantProfilePage } from './pages/MerchantProfilePage';
import { DeviceProfilePage } from './pages/DeviceProfilePage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Central Data Initializer
const generateInitialTransactions = (): Transaction[] => {
  const categories = ['Shopping', 'Food', 'Travel', 'Financial Services', 'Luxury', 'Bills'];
  const merchants = ['XYZ Electronics', 'Swiggy Food', 'MakeMyTrip', 'Apex Crypto Exchange', 'Amazon India', 'Uber Travels', 'Global Tech Luxury Store'];
  const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];
  const locations = ['Delhi, India', 'Mumbai, India', 'Bengaluru, India', 'London, UK', 'Dubai, UAE'];
  const typologies = ['Account Takeover', 'Impossible Travel Velocity', 'Rapid Velocity Burst', 'Card Testing Attack', 'High Amount Crypto Drain'];

  return Array.from({ length: 150 }, (_, i) => {
    const isFraud = i % 8 === 0 || i === 0;
    const amount = isFraud ? Math.floor(Math.random() * 85000 + 35000) : Math.floor(Math.random() * 8000 + 200);
    const riskLevel = isFraud ? (i % 2 === 0 ? 'CRITICAL' : 'HIGH') : (i % 5 === 0 ? 'MEDIUM' : 'LOW');
    const riskScore = isFraud ? Number((Math.random() * 0.2 + 0.78).toFixed(2)) : Number((Math.random() * 0.2 + 0.02).toFixed(2));

    return {
      id: `id_${i + 1}`,
      transaction_id: i === 0 ? 'TXN-94821' : `TXN-${10000 + i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      amount: amount,
      currency: 'INR',
      merchant: i === 0 ? 'XYZ Electronics' : merchants[i % merchants.length],
      merchant_category: categories[i % categories.length],
      payment_method: paymentMethods[i % paymentMethods.length],
      location: locations[i % locations.length],
      account_id: `ACC-${5000 + (i % 20)}`,
      customer_id: `CUST-${1000 + (i % 20)}`,
      device_id: isFraud ? `DEV-NEW-${9000 + i}` : `DEV-${100 + (i % 15)}`,
      ip_address: `192.168.1.${i % 255}`,
      transaction_type: 'PAYMENT',
      status: 'COMPLETED',
      fraud_probability: riskScore,
      anomaly_score: Number((riskScore * 0.95).toFixed(2)),
      risk_score: riskScore,
      risk_level: riskLevel,
      fraud_typology: isFraud ? typologies[i % typologies.length] : 'Normal Authorized Payment',
      created_at: new Date(Date.now() - i * 3600000).toISOString()
    };
  });
};

const MainContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(generateInitialTransactions());
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCustId, setSelectedCustId] = useState<string>('CUST-1042');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('MRC-102');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('DEV-NEW-9841');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchLiveTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      }
    } catch {
      // Keep local generated transactions on network failure
    }
  };

  useEffect(() => {
    fetchLiveTransactions();
  }, []);

  const handleReloadDemo = () => {
    fetchLiveTransactions();
  };

  const handleSelectTransaction = (txnId: string) => {
    setSelectedTxnId(txnId);
    setCurrentPath(`/transactions/${txnId}`);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentPath(`/investigations/${caseId}`);
  };

  const renderView = () => {
    if (currentPath.startsWith('/transactions/') && selectedTxnId) {
      return (
        <TransactionDetailPage
          transactionId={selectedTxnId}
          transactions={transactions}
          onBack={() => setCurrentPath('/transactions')}
          onNavigateCustomer={(cId) => { setSelectedCustId(cId); setCurrentPath(`/customers/${cId}`); }}
          onNavigateMerchant={(mId) => { setSelectedMerchantId(mId); setCurrentPath(`/merchants/${mId}`); }}
          onNavigateDevice={(dId) => { setSelectedDeviceId(dId); setCurrentPath(`/devices/${dId}`); }}
        />
      );
    }

    if (currentPath.startsWith('/investigations/') && selectedCaseId) {
      return (
        <InvestigationDetailPage
          caseId={selectedCaseId}
          onBack={() => setCurrentPath('/investigations')}
        />
      );
    }

    if (currentPath.startsWith('/customers')) {
      return (
        <CustomerProfilePage
          customerId={selectedCustId}
          transactions={transactions}
          onSelectTransaction={handleSelectTransaction}
          onBack={() => setCurrentPath('/dashboard')}
        />
      );
    }

    if (currentPath.startsWith('/merchants')) {
      return (
        <MerchantProfilePage
          merchantId={selectedMerchantId}
          transactions={transactions}
          onSelectTransaction={handleSelectTransaction}
          onBack={() => setCurrentPath('/dashboard')}
        />
      );
    }

    if (currentPath.startsWith('/devices')) {
      return (
        <DeviceProfilePage
          deviceId={selectedDeviceId}
          transactions={transactions}
          onSelectTransaction={handleSelectTransaction}
          onBack={() => setCurrentPath('/dashboard')}
        />
      );
    }

    switch (currentPath) {
      case '/':
        return <LandingPage onExploreDashboard={() => setCurrentPath('/dashboard')} />;
      case '/dashboard':
        return <Dashboard transactions={transactions} onSelectTransaction={handleSelectTransaction} />;
      case '/transactions':
        return <TransactionsPage transactions={transactions} onSelectTransaction={handleSelectTransaction} />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/fraud':
        return <FraudAnalyticsPage />;
      case '/alerts':
        return (
          <AlertsPage
            onSelectTransaction={handleSelectTransaction}
            onOpenCase={(txnId) => {
              setSelectedCaseId('CASE-10231');
              setCurrentPath('/investigations/CASE-10231');
            }}
          />
        );
      case '/investigations':
        return <InvestigationsPage onSelectCase={handleSelectCase} />;
      case '/assistant':
        return <AssistantPage />;
      case '/models':
        return <MLOpsPage />;
      case '/admin':
        return <AdminRulesPage />;
      case '/audit-logs':
        return <AuditLogsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/login':
        return <LoginPage onLoginSuccess={() => setCurrentPath('/dashboard')} />;
      case '/signup':
        return <SignupPage onSignupSuccess={() => setCurrentPath('/dashboard')} />;
      default:
        return <Dashboard transactions={transactions} onSelectTransaction={handleSelectTransaction} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar
        onReloadDemo={handleReloadDemo}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleReloadDemo}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};
