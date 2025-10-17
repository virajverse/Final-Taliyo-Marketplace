'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface Service {
  id: string;
  title: string;
  price_min?: number;
  price_max?: number;
  provider_name?: string;
  rating_average?: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service }) => {
  const { isLoggedIn, redirectToLogin, user } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    requirements: '',
    budgetRange: '',
    deliveryPreference: '',
    additionalNotes: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [sameWhatsApp, setSameWhatsApp] = useState(true);
  const [cartPreview, setCartPreview] = useState<any[]>([]);
  const isCustom = (service?.id === 'custom') || (String(service?.title || '').toLowerCase().includes('custom'));

  // अगर यूजर लॉग्ड इन नहीं है तो लॉगिन पेज पर रीडायरेक्ट करें
  const handleAction = () => {
    if (!isLoggedIn) {
      onClose();
      redirectToLogin();
      return;
    }
  };
  
  // लॉगिन यूजर का डाटा फॉर्म में ऑटोफिल करें
  useEffect(() => {
    if (isLoggedIn && user) {
      // लोकल स्टोरेज से यूजर का फोन नंबर प्राप्त करें (अगर उपलब्ध हो)
      const userPhone = localStorage.getItem('userPhone') || '';
      
      setForm(prevForm => ({
        ...prevForm,
        fullName: user.name || '',
        email: user.email || '',
        phone: userPhone,
        whatsappNumber: userPhone // व्हाट्सएप नंबर भी फोन नंबर से भरें
      }));
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('cart');
        const parsed = saved ? JSON.parse(saved) : [];
        if (!isCustom && (!parsed || parsed.length === 0) && service?.id) {
          const fallback = [{
            id: service.id,
            service_id: service.id,
            title: service.title,
            price_min: (service as any)?.price_min,
            price_max: (service as any)?.price_max,
            quantity: 1
          }];
          setCartPreview(fallback);
        } else {
          setCartPreview(parsed || []);
        }
      } catch { setCartPreview([]); }

      if (isCustom && !form.requirements.trim()) {
        setForm(prev => ({
          ...prev,
          requirements: 'Describe your custom requirement here...'
        }));
      }
    }
  }, [isOpen, isCustom, service?.id, service?.title]);

  useEffect(() => {
    if (sameWhatsApp && form.whatsappNumber !== form.phone) {
      setForm(prev => ({ ...prev, whatsappNumber: prev.phone }));
    }
  }, [sameWhatsApp, form.phone]);

  const priceText = () => {
    const min = (service as any).price_min as number | undefined;
    const max = (service as any).price_max as number | undefined;
    if (min && max) {
      if (min === max) return `₹${min.toLocaleString()}`;
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    }
    if (min) return `From ₹${min.toLocaleString()}`;
    return 'Price on request';
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    // Limit 5 files, 10MB each
    const merged = [...files, ...selected].slice(0, 5).filter(f => f.size <= 10 * 1024 * 1024);
    setFiles(merged);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selected = Array.from(e.dataTransfer.files || []);
    if (!selected.length) return;
    const merged = [...files, ...selected].slice(0, 5).filter(f => f.size <= 10 * 1024 * 1024);
    setFiles(merged);
  };
  
  // फोन नंबर को लोकल स्टोरेज में सेव करें ताकि भविष्य में उपयोग किया जा सके
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'phone') {
      localStorage.setItem('userPhone', value);
    }
    
    // Clear validation error when user types
    if (validation[name]) {
      setValidation(prev => {
        const newValidation = { ...prev };
        delete newValidation[name];
        return newValidation;
      });
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const v: Record<string, string> = {};
    if (!form.fullName.trim()) v.fullName = 'Full name is required';
    if (!form.phone.trim()) v.phone = 'Phone number is required';
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) v.phone = 'Enter a valid phone number';
    if (!form.email.trim()) v.email = 'Email is required';
    else if (!/.+@.+\..+/.test(form.email)) v.email = 'Enter a valid email';
    if (!form.whatsappNumber.trim()) v.whatsappNumber = 'WhatsApp number is required';
    else if (form.whatsappNumber.replace(/\D/g, '').length < 10) v.whatsappNumber = 'Enter a valid WhatsApp number';
    if (form.requirements && form.requirements.trim() && form.requirements.trim().length < 10) v.requirements = 'Please add a bit more detail (min 10 chars)';
    setValidation(v);
    return Object.keys(v).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');
    if (!validate()) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      // service info
      fd.append('serviceId', String(service.id));
      fd.append('serviceTitle', String(service.title || ''));
      fd.append('servicePrice', priceText());
      fd.append('providerName', String((service as any).provider_name || ''));
      // form fields
      fd.append('fullName', form.fullName);
      fd.append('phone', form.phone);
      if (form.email) fd.append('email', form.email);
      if (form.whatsappNumber) fd.append('whatsappNumber', form.whatsappNumber);
      fd.append('requirements', form.requirements);
      fd.append('budgetRange', form.budgetRange || '');
      fd.append('deliveryPreference', form.deliveryPreference || '');
      // snake_case duplicates for compatibility
      fd.append('full_name', form.fullName);
      fd.append('customer_phone', form.phone);
      if (form.email) fd.append('customer_email', form.email);
      fd.append('requirements_text', form.requirements);
      fd.append('budget_range', form.budgetRange || '');
      fd.append('delivery_preference', form.deliveryPreference || '');
      if (form.additionalNotes) fd.append('additionalNotes', form.additionalNotes);
      // cart (optional)
      try {
        let items: any[] = [];
        if (!isCustom) {
          const saved = localStorage.getItem('cart');
          if (saved) {
            try { items = JSON.parse(saved) || []; } catch { items = []; }
          }
        }
        if ((!items || items.length === 0)) {
          if (isCustom) {
            items = [{ id: 'custom', service_id: 'custom', title: 'Custom Order', quantity: 1, custom: true }];
          } else if (service?.id) {
            items = [{
              id: service.id,
              service_id: service.id,
              title: service.title,
              price_min: (service as any)?.price_min,
              price_max: (service as any)?.price_max,
              quantity: 1
            }];
          }
        }
        if (items && items.length > 0) {
          const cartJson = JSON.stringify(items);
          fd.append('cartItems', cartJson);
          fd.append('cart_items', cartJson);
          fd.append('cart', cartJson);
        }
        fd.append('source', isCustom ? 'custom_order' : 'book_now');
      } catch {}
      // files
      files.forEach((file, idx) => fd.append(`file_${idx}`, file));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit booking');
      }
      setServerSuccess('Your order has been submitted successfully!');
      // Optionally reset
      setForm({ fullName: '', phone: '', email: '', whatsappNumber: '', requirements: '', budgetRange: '', deliveryPreference: '', additionalNotes: '' });
      setFiles([]);
      // Close after a short delay
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setServerError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const cartSubtotal = cartPreview.reduce((sum, it) => sum + ((Number((it as any)?.price_min) || 0) * ((it as any)?.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-start md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl md:max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold">{isCustom ? 'Custom Booking' : 'Place Order'}</h2>
            {!isCustom && (
              <p className="text-sm text-gray-600 mt-0.5">{service.title} — {priceText()}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto no-scrollbar" style={{ maxHeight: '85dvh' }}>
          <div className="px-6 py-5 pb-28 space-y-6 flex-1">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">{serverError}</div>
            )}
            {serverSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">{serverSuccess}</div>
            )}

            {!isCustom && cartPreview.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {cartPreview.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="truncate pr-2">{it.title} × {it.quantity || 1}</div>
                      <div className="font-medium">₹{((Number(it?.price_min) || 0) * (it?.quantity || 1)).toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                    required
                  />
                  {validation.fullName && <p className="text-xs text-red-600 mt-1">{validation.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 9876543210"
                    required
                  />
                  {validation.phone && <p className="text-xs text-red-600 mt-1">{validation.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                    required
                  />
                  {validation.email && <p className="text-xs text-red-600 mt-1">{validation.email}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input type="checkbox" checked={sameWhatsApp} onChange={(e) => {
                        setSameWhatsApp(e.target.checked);
                        if (e.target.checked) setForm(prev => ({ ...prev, whatsappNumber: prev.phone }));
                      }} />
                      Same as phone
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.whatsappNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="WhatsApp number"
                    required
                    disabled={sameWhatsApp}
                  />
                  {validation.whatsappNumber && <p className="text-xs text-red-600 mt-1">{validation.whatsappNumber}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Project Requirements</h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you need? Please describe in detail</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.requirements ? 'border-red-500' : 'border-gray-300'}`}
                rows={5}
                placeholder="e.g., I need an e-commerce website with payment gateway..."
              />
              {validation.requirements && <p className="text-xs text-red-600 mt-1">{validation.requirements}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Budget Range</h4>
                <select
                  value={form.budgetRange}
                  onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                >
                  <option value="">Select Budget</option>
                  <option value="under_10k">Under ₹10,000</option>
                  <option value="10k_25k">₹10,000 - ₹25,000</option>
                  <option value="25k_50k">₹25,000 - ₹50,000</option>
                  <option value="50k_1l">₹50,000 - ₹1,00,000</option>
                  <option value="above_1l">Above ₹1,00,000</option>
                </select>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Preference</h4>
                <select
                  value={form.deliveryPreference}
                  onChange={(e) => setForm({ ...form, deliveryPreference: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                >
                  <option value="">Select Timeline</option>
                  <option value="1_2_weeks">1 - 2 weeks</option>
                  <option value="2_4_weeks">2 - 4 weeks</option>
                  <option value="1_2_months">1 - 2 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes (Optional)</h3>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={3}
                placeholder="Any special requirements or questions..."
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Files (Optional)</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or</p>
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer">
                  <input type="file" className="hidden" multiple onChange={onFileSelect} />
                  <span className="text-blue-600">browse</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, SVG, PDF, TXT (Max 10MB each, 5 files total)</p>
              </div>
              {files.length > 0 && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="truncate mr-2">{f.name}</span>
                      <button type="button" onClick={() => removeFile(idx)} className="text-red-600 hover:underline text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-gray-200 bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 w-full sm:w-auto">
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
