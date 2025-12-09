import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabase';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

export const DeliveryPartnerSignup: React.FC = () => {
  const [step, setStep] = useState<'login' | 'signup' | 'profile'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Check if user just verified email
  useEffect(() => {
    const checkVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true') {
        setJustVerified(true);
        
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if profile already exists
          const { data: profile } = await supabase
            .from('delivery_persons')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            // Profile exists, redirect to dashboard
            window.location.href = '/delivery-dashboard';
          } else {
            // Load user data from metadata
            const metadata = user.user_metadata;
            setCurrentUserId(user.id);
            setFullName(metadata.full_name || '');
            setPhone(metadata.phone || '');
            setVehicleType(metadata.vehicle_type || '');
            setVehicleNumber(metadata.vehicle_number || '');
            setStep('profile');
          }
        }
      }
    };
    checkVerification();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is a delivery person
      const { data: deliveryPerson } = await supabase
        .from('delivery_persons')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (deliveryPerson) {
        window.location.href = '/delivery-dashboard';
      } else {
        setError('Account not found as delivery partner. Please sign up.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'delivery_partner',
          }
        }
      });

      if (authError) throw authError;
      
      // If email confirmation is required, show message
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account, then login.');
        setStep('login');
        return;
      }

      if (!data.user) throw new Error('Failed to create user');

      setCurrentUserId(data.user.id);
      setStep('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!currentUserId) throw new Error('Not authenticated');

      // Create delivery person profile
      const { error: profileError } = await supabase
        .from('delivery_persons')
        .insert([{
          user_id: currentUserId,
          full_name: fullName,
          phone: phone,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          is_active: true,
          is_available: true,
        }]);

      if (profileError) throw profileError;

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/delivery-dashboard';
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground">
              Your delivery partner account has been created. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            {step === 'login' && 'Delivery Partner Login'}
            {step === 'signup' && 'Become a Delivery Partner'}
            {step === 'profile' && 'Complete Your Profile'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'login' && 'Sign in to access your delivery dashboard'}
            {step === 'signup' && 'Join our delivery network'}
            {step === 'profile' && 'Tell us about your vehicle'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'signup' && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Note:</strong> Email service is not configured. Please contact the admin to create your delivery partner account, or login if your account already exists.
              </AlertDescription>
            </Alert>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setStep('signup')}
                  className="text-sm"
                >
                  Don't have an account? Sign up
                </Button>
              </div>
            </form>
          )}

          {step === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled
                  placeholder="Contact admin to create account"
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled
                  placeholder="••••••••"
                  minLength={6}
                  className="bg-gray-100"
                />
              </div>
              <Button type="submit" className="w-full" disabled>
                Signup Currently Unavailable
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setStep('login')}
                  className="text-sm"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {justVerified && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Email Verified Successfully!</strong><br />
                    Please complete your profile to finish setup.
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select value={vehicleType} onValueChange={setVehicleType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">Bike/Motorcycle</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                <Input
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  required
                  placeholder="KA01AB1234"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Completing registration...' : 'Complete Registration'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
