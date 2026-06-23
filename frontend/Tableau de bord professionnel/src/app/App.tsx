import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Companies } from './components/Companies';
import { Professionals } from './components/Professionals';
import { Training } from './components/Training';
import { EconomicWatch } from './components/EconomicWatch';
import { MessageBubble } from './components/MessageBubble';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies':
        return <Companies />;
      case 'professionals':
        return <Professionals />;
      case 'training':
        return <Training />;
      case 'economic-watch':
        return <EconomicWatch />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
      <MessageBubble />
    </div>
  );
}