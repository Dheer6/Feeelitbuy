import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase } from '../../lib/deliveryService';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface CreateDeliveryPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateDeliveryPartnerDialog: React.FC<CreateDeliveryPartnerDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setVehicleType('');
    setVehicleNumber('');
    setError(null);
    setSuccess(false);
    setEmailSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the auth user and send verification email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'delivery_partner',
            full_name: fullName,
            phone: phone,
            vehicle_type: vehicleType,
            vehicle_number: vehicleNumber,
          },
          emailRedirectTo: `${window.location.origin}/delivery-signup?verified=true`,
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Store user ID temporarily to create profile after email verification
      // For now, just show success message
      setEmailSent(true);
      setSuccess(true);
      
      setTimeout(() => {
        resetForm();
        onSuccess();
        onOpenChange(false);
      }, 6000);
    } catch (err: any) {
      console.error('Create partner error:', err);
      setError(err.message || 'Failed to create delivery partner');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Delivery Partner</DialogTitle>
          <DialogDescription>
            Add a new delivery partner to your network
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <div className="text-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Email Sent!</h3>
              <p className="text-muted-foreground">
                Account created for <strong>{fullName}</strong>
              </p>
            </div>
            
            <Alert className="text-left bg-blue-50 border-blue-200 mb-4">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 space-y-2">
                <div>
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Verification email sent to: <span className="font-mono">{email}</span></li>
                    <li>Partner must check their email and click the verification link</li>
                    <li>After verification, they will be redirected to complete their profile with vehicle details</li>
                    <li>Then they can login with:
                      <div className="ml-4 mt-1 font-mono text-sm">
                        Email: {email}<br />
                        Password: {password}
                      </div>
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-center text-muted-foreground">
              Please inform the partner to check their email inbox (and spam folder).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="partner@example.com"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="col-span-2">
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
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">Bike</SelectItem>
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
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Partner'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
