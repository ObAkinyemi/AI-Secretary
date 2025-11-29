"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed Background 
        - Reduced opacity to 20 (was 40) so the background is more visible
      */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      {/* Modal Content
        - Changed background to Violet-900
        - Added a Violet border to separate it from the dark page background
        - Updated text colors for contrast
      */}
      <div className="relative z-10 w-full max-w-lg bg-[#3f176e] rounded-xl shadow-2xl p-6 border border-violet-500/50 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-violet-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-violet-200 hover:text-white" />
          </button>
        </div>
        {/* Wrapper for content to ensure text inherits readable color */}
        <div className="text-violet-50">
          {children}
        </div>
      </div>
    </div>
  );
}