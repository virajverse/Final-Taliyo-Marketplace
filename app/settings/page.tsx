'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

import { 
  ArrowLeft, 
  User, 
  Bell, 
  Globe, 
  Moon, 
  Shield, 
  CreditCard,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
  };
  preferences: {
    language: string;
    darkMode: boolean;
    currency: string;
  };
}

interface SettingItem {
  icon: any;
  label: string;
  value: any;
  type?: 'toggle';
  href?: string;
  showArrow?: boolean;
  onChange?: (value: boolean) => void;
}

export default function Settings() {
  const { isLoggedIn, user: authUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      push: true,
      email: true,
      sms: false
    },
    privacy: {
      profileVisible: true,
    },
    preferences: {
      language: 'English',
      darkMode: false,
      currency: 'INR'
    }
  });

  const [user, setUser] = useState<any>(null);

  // Load initial user and settings from Supabase auth metadata
  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = (data.user?.user_metadata as any) || {};
      const s = meta.settings || {};
      setSettings(prev => ({
        notifications: {
          push: typeof s?.notifications?.push === 'boolean' ? s.notifications.push : prev.notifications.push,
          email: typeof s?.notifications?.email === 'boolean' ? s.notifications.email : prev.notifications.email,
          sms: typeof s?.notifications?.sms === 'boolean' ? s.notifications.sms : prev.notifications.sms,
        },
        privacy: {
          profileVisible: typeof s?.privacy?.profileVisible === 'boolean' ? s.privacy.profileVisible : prev.privacy.profileVisible,
        },
        preferences: {
          language: s?.preferences?.language || prev.preferences.language,
          darkMode: typeof s?.preferences?.darkMode === 'boolean' ? s.preferences.darkMode : prev.preferences.darkMode,
          currency: prev.preferences.currency, // do not load or sync currency from metadata
        },
      }));
    })();
  }, []);

  const updateSetting = async (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    // Persist live to auth metadata, except currency
    if (category === 'preferences' && key === 'currency') return;
    try {
      const payload = {
        notifications: { ...settings.notifications, ...(category === 'notifications' ? { [key]: value } : {}) },
        privacy: { ...settings.privacy, ...(category === 'privacy' ? { [key]: value } : {}) },
        preferences: { ...settings.preferences, ...(category === 'preferences' ? { [key]: value } : {}) },
      };
      // Do not include currency in payload
      delete (payload.preferences as any).currency;
      await supabase.auth.updateUser({ data: { settings: payload } });
    } catch {}
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          value: user?.name || 'Update your profile',
          href: '/profile',
          showArrow: true
        },
        {
          icon: Phone,
          label: 'Phone Number',
          value: user?.phone || 'Add phone number',
          href: '/profile',
          showArrow: true
        },
        {
          icon: Mail,
          label: 'Email Address',
          value: user?.email || 'Add email',
          href: '/profile',
          showArrow: true
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          value: settings.notifications.push,
          type: 'toggle',
          onChange: (value: boolean) => updateSetting('notifications', 'push', value)
        },
        {
          icon: Mail,
          label: 'Email Notifications',
          value: settings.notifications.email,
          type: 'toggle',
          onChange: (value: boolean) => updateSetting('notifications', 'email', value)
        },
        {
          icon: Phone,
          label: 'SMS Notifications',
          value: settings.notifications.sms,
          type: 'toggle',
          onChange: (value: boolean) => updateSetting('notifications', 'sms', value)
        }
      ]
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: User,
          label: 'Profile Visibility',
          value: settings.privacy.profileVisible,
          type: 'toggle',
          onChange: (value: boolean) => updateSetting('privacy', 'profileVisible', value)
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          value: settings.preferences.language,
          href: '/settings/language',
          showArrow: true
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          value: settings.preferences.darkMode,
          type: 'toggle',
          onChange: (value: boolean) => updateSetting('preferences', 'darkMode', value)
        },
        {
          icon: CreditCard,
          label: 'Currency',
          value: settings.preferences.currency,
          href: '/settings/currency',
          showArrow: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4">
                    {item.type === 'toggle' ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                        
                        <button
                          onClick={() => item.onChange && item.onChange(!item.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.value ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className="flex items-center justify-between hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{item.label}</span>
                            <span className="text-sm text-gray-500">{item.value}</span>
                          </div>
                        </div>
                        
                        {item.showArrow && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-6 space-y-3">
          <Link
            href="/privacy"
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}