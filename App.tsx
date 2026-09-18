import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { TTSStudio } from './TTSStudio';
import { ByokSettings } from './ByokSettings';
import { AccountView } from './AccountView';
import { PlansView } from './PlansView';
import { IsolationSuite } from './IsolationSuite';
import { AuthModal } from './AuthModal';
import { IslamicHeader } from './IslamicHeader';
import { ShareSection } from './ShareSection';
import { SeoSection } from './SeoSection';

import {
  getUserBalance,
  getUserSettings,
  getUserGenerations,
} from './services/apiClient';

import {
  UserBalance,
  UserSettings,
  TTSGeneration,
} from './types/tts';

function MainApp() {
  const { user, getIdToken } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'studio' | 'byok' | 'account' | 'plans' | 'isolation'
  >('studio');

  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [generations, setGenerations] = useState<TTSGeneration[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setSettings(null);
      setGenerations([]);
      return;
    }

    setIsDataLoading(true);

    try {
      const token = await getIdToken();

      const [balData, settData, gensData] = await Promise.all([
        getUserBalance(token).catch(() => null),
        getUserSettings(token).catch(() => null),
        getUserGenerations(token).catch(() => []),
      ]);

      if (balData) setBalance(balData);
      if (settData) setSettings(settData);
      if (gensData) setGenerations(gensData);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user, getIdToken]);

  return (
    <div>
      <IslamicHeader />

      <TTSStudio
        balance={balance}
        settings={settings}
        generations={generations}
        isDataLoading={isDataLoading}
      />

      <ShareSection />
      <SeoSection />

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
