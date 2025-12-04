import { Mail, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface SignupSuccessProps {
  email: string;
  onClose: () => void;
}

export function SignupSuccess({ email, onClose }: SignupSuccessProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Signup Successful!</h2>
          <p className="text-gray-600">Welcome to FeelItBuy</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Verify Your Email
              </p>
              <p className="text-sm text-blue-800 mb-2">
                We've sent a verification link to:
              </p>
              <p className="text-sm font-mono text-blue-900 bg-white px-3 py-2 rounded border border-blue-200 break-all">
                {email}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <p className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">1.</span>
            Check your inbox for the verification email
          </p>
          <p className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">2.</span>
            Click the verification link in the email
          </p>
          <p className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">3.</span>
            Come back and login with your credentials
          </p>
        </div>

        <div className="text-xs text-gray-500 mb-6">
          <p>Didn't receive the email? Check your spam folder or</p>
          <button className="text-indigo-600 hover:underline font-medium">
            resend verification email
          </button>
        </div>

        <Button onClick={onClose} className="w-full">
          Got it, Back to Login
        </Button>
      </Card>
    </div>
  );
}
