'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data Usage', icon: FileText }
  ];

  const privacyContent = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Information We Collect',
          content: 'We collect information you provide directly to us, such as when you create an account, book services, or contact us for support.',
          icon: Info
        },
        {
          title: 'How We Use Your Information',
          content: 'We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.',
          icon: CheckCircle
        },
        {
          title: 'Information Sharing',
          content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
          icon: Shield
        },
        {
          title: 'Data Security',
          content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          icon: Lock
        }
      ]
    },
    security: {
      title: 'Security Measures',
      sections: [
        {
          title: 'Account Security',
          content: 'Your account is protected by encryption and secure authentication methods. We recommend using a strong, unique password.',
          icon: Lock
        },
        {
          title: 'Data Encryption',
          content: 'All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols.',
          icon: Shield
        },
        {
          title: 'Regular Security Audits',
          content: 'We conduct regular security audits and vulnerability assessments to ensure your data remains secure.',
          icon: CheckCircle
        },
        {
          title: 'Incident Response',
          content: 'In the unlikely event of a security incident, we have procedures in place to respond quickly and notify affected users.',
          icon: AlertTriangle
        }
      ]
    },
    data: {
      title: 'Data Usage & Rights',
      sections: [
        {
          title: 'Data Collection',
          content: 'We only collect data that is necessary to provide our services. This includes profile information, booking history, and usage analytics.',
          icon: Info
        },
        {
          title: 'Your Rights',
          content: 'You have the right to access, update, or delete your personal information at any time through your account settings.',
          icon: Eye
        },
        {
          title: 'Data Retention',
          content: 'We retain your data only as long as necessary to provide services and comply with legal obligations.',
          icon: FileText
        },
        {
          title: 'Third-Party Services',
          content: 'We may use trusted third-party services for analytics and payments. These partners are bound by strict data protection agreements.',
          icon: Shield
        }
      ]
    }
  };

  const currentContent = privacyContent[activeTab as keyof typeof privacyContent];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
            <p className="text-gray-600">Your data protection and security information</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{currentContent.title}</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {currentContent.sections.map((section, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Questions about Privacy?</h3>
              <p className="text-blue-800 mb-4">
                If you have any questions about our privacy practices or need to update your preferences, 
                we're here to help.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Contact Support
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Last updated: January 15, 2024
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}