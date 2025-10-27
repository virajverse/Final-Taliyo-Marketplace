'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  Shield,
  CreditCard,
  Users,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book a service on Taliyo Marketplace?',
      answer: 'You can book a service by browsing our categories, selecting a service, and clicking "Book via WhatsApp". You\'ll be redirected to WhatsApp to complete your booking with our team.',
      category: 'booking'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including UPI, credit/debit cards, net banking, and cash payments. Payment terms are discussed during the booking process.',
      category: 'payment'
    },
    {
      id: '3',
      question: 'How do I cancel or reschedule my booking?',
      answer: 'You can cancel or reschedule your booking by contacting the service provider directly via WhatsApp or calling our support team. Cancellation policies may vary by service.',
      category: 'booking'
    },
    {
      id: '4',
      question: 'Are all service providers verified?',
      answer: 'Yes, all our service providers go through a verification process including background checks, skill assessments, and customer reviews to ensure quality service.',
      category: 'safety'
    },
    {
      id: '5',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied with the service, please contact our support team within 24 hours. We\'ll work with you and the provider to resolve the issue or provide a refund if applicable.',
      category: 'support'
    },
    {
      id: '6',
      question: 'How do I become a service provider on Taliyo Marketplace?',
      answer: 'To become a service provider, you can apply through our partner registration process. We\'ll review your application, verify your credentials, and onboard you to our platform.',
      category: 'provider'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'booking', name: 'Booking', icon: Calendar },
    { id: 'payment', name: 'Payments', icon: CreditCard },
    { id: 'safety', name: 'Safety', icon: Shield },
    { id: 'support', name: 'Support', icon: HelpCircle },
    { id: 'provider', name: 'Providers', icon: Users }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: 'Get instant help via WhatsApp',
      action: 'Chat Now',
      color: 'bg-green-500',
      onClick: () => {
        const message = 'Hi! I need help with Taliyo Marketplace services.';
        const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
        if (!supportWhatsapp) { console.warn('Support WhatsApp not configured'); return; }
        const whatsappUrl = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      icon: Phone,
      title: 'Call Support',
      description: 'Speak with our support team',
      action: 'Call Now',
      color: 'bg-blue-500',
      onClick: () => {
        const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE;
        if (!supportPhone) { console.warn('Support phone not configured'); return; }
        window.location.href = `tel:${supportPhone}`;
      }
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your queries via email',
      action: 'Send Email',
      color: 'bg-purple-500',
      onClick: () => {
        window.location.href = 'mailto:support@taliyo.com?subject=Support Request';
      }
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">We're here to help you with any questions</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactMethods.map((method, index) => (
            <button
              key={index}
              onClick={method.onClick}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left"
            >
              <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                <method.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{method.description}</p>
              <span className="text-sm font-medium text-blue-600">{method.action}</span>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try different keywords or browse all topics</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status & Updates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Service Status
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">All Systems Operational</p>
                <p className="text-sm text-gray-600">All services are running normally</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Average Response Time</p>
                <p className="text-sm text-gray-600">WhatsApp: 2-5 minutes • Phone: Immediate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => {
              const message = 'Hi! I need help with Taliyo Marketplace services. I couldn\'t find the answer to my question in the FAQ.';
              const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '917042523611';
              const whatsappUrl = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}