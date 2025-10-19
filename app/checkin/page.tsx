'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface CheckInFormData {
  userIdNumber: string;
  fullName: string;
  purpose: string;
}

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const position = searchParams.get('position') as 'Student' | 'Staff' | 'Visitor';
  
  const [formData, setFormData] = useState<CheckInFormData>({
    userIdNumber: '',
    fullName: '',
    purpose: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!position || !['Student', 'Staff', 'Visitor'].includes(position)) {
      router.push('/');
    }
  }, [position, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          position,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Check-in successful! Welcome to Knox Community College.');
        setFormData({ userIdNumber: '', fullName: '', purpose: '' });
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setMessage(result.error || 'Check-in failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionColor = () => {
    switch (position) {
      case 'Student': return 'from-blue-500 to-blue-600';
      case 'Staff': return 'from-green-500 to-green-600';
      case 'Visitor': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!position) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <div className={`w-12 h-12 bg-gradient-to-br ${getPositionColor()} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">KCC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Knox Community College
          </h1>
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getPositionColor()} text-white font-semibold`}>
            {position} Check-in
          </div>
        </div>

        {/* Check-in Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Number */}
            <div>
              <label htmlFor="userIdNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your ID#
              </label>
              <input
                type="text"
                id="userIdNumber"
                required
                value={formData.userIdNumber}
                onChange={(e) => setFormData({ ...formData, userIdNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your ID number"
              />
            </div>

            {/* Full Name (Optional) */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            {/* Purpose (Required for Students and Visitors) */}
            {(position === 'Student' || position === 'Visitor') && (
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit *
                </label>
                <textarea
                  id="purpose"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Please describe the purpose of your visit..."
                />
              </div>
            )}

            {/* Purpose (Optional for Staff) */}
            {position === 'Staff' && (
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any specific purpose or notes..."
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r ${getPositionColor()} text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Checking In...
                </div>
              ) : (
                'Check In'
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Back to Home
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}