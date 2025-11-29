import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText } from "lucide-react";

export default function SafetyInformation() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-blue-500/20 rounded-full mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Safety & Legal Information</h1>
          <p className="text-gray-400 mt-2">
            Transparency about how we protect your data and the rules of our service.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Privacy Policy Card */}
          <Link href="/privacy-policy" className="group">
            <div className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 p-6 rounded-xl transition-all h-full hover:shadow-lg hover:border-blue-500/50">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Privacy Policy
                </h2>
              </div>
              <p className="text-sm text-gray-400">
                Learn how we handle your data, your calendar permissions, and your privacy rights.
              </p>
            </div>
          </Link>

          {/* Terms of Service Card */}
          <Link href="/terms" className="group">
            <div className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 p-6 rounded-xl transition-all h-full hover:shadow-lg hover:border-blue-500/50">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Terms of Service
                </h2>
              </div>
              <p className="text-sm text-gray-400">
                Read the rules, requirements, and limitations of liability for using AI Secretary.
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-10 text-center border-t border-gray-700 pt-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium">
            &larr; Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}