'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Book Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p>Booking form coming soon!</p>
      </div>
    </div>
  );
};

export default BookingModal;
