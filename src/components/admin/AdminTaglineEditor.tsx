import { useState, useEffect } from 'react';
import { Save, Edit2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export function AdminTaglineEditor() {
  const [settings, setSettings] = useState({
    tagline: 'Feel the Quality, Buy with Confidence',
    company_name: 'Feel It Buy',
    support_email: 'support@feelitbuy.com',
    support_phone: '+91-XXXXXXXXXX',
    return_policy_days: 30,
    warranty_days: 365,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState(settings);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { appSettingsService } = await import('../../lib/supabaseService');
        
        const tagline = await appSettingsService.getSetting('tagline');
        const company = await appSettingsService.getSetting('company_name');
        const email = await appSettingsService.getSetting('support_email');
        const phone = await appSettingsService.getSetting('support_phone');
        const returnDays = await appSettingsService.getSetting('return_policy_days');
        const warrantyDays = await appSettingsService.getSetting('warranty_days');

        const updatedSettings = {
          tagline: tagline || settings.tagline,
          company_name: company || settings.company_name,
          support_email: email || settings.support_email,
          support_phone: phone || settings.support_phone,
          return_policy_days: returnDays ? parseInt(returnDays) : 30,
          warranty_days: warrantyDays ? parseInt(warrantyDays) : 365,
        };

        setSettings(updatedSettings);
        setFormData(updatedSettings);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { appSettingsService } = await import('../../lib/supabaseService');

      // Save each setting
      await Promise.all([
        appSettingsService.updateSetting('tagline', formData.tagline),
        appSettingsService.updateSetting('company_name', formData.company_name),
        appSettingsService.updateSetting('support_email', formData.support_email),
        appSettingsService.updateSetting('support_phone', formData.support_phone),
        appSettingsService.updateSetting('return_policy_days', String(formData.return_policy_days)),
        appSettingsService.updateSetting('warranty_days', String(formData.warranty_days)),
      ]);

      setSettings(formData);
      setIsEditing(false);
      setStatus({
        success: true,
        message: 'Settings saved successfully!',
      });

      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({
        success: false,
        message: 'Error: ' + (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">App Settings</h1>
          <p className="text-gray-600 mt-1">Manage site tagline and company information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {status && (
        <Card className={`p-4 flex items-center gap-3 ${
          status.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {status.success ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={status.success ? 'text-green-700' : 'text-red-700'}>
            {status.message}
          </p>
        </Card>
      )}

      {/* Settings Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Tagline */}
          <div>
            <Label htmlFor="tagline" className="text-base font-semibold">
              Site Tagline
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Displayed on the homepage hero section
            </p>
            {isEditing ? (
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Enter tagline..."
                className="mt-2"
                maxLength={100}
              />
            ) : (
              <div className="mt-2 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <p className="text-lg font-semibold text-indigo-900">
                  "{settings.tagline}"
                </p>
              </div>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.tagline.length}/100 characters
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="company_name" className="text-base font-semibold">
              Company Name
            </Label>
            {isEditing ? (
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter company name..."
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-gray-700">{settings.company_name}</p>
            )}
          </div>

          {/* Support Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="support_email" className="text-base font-semibold">
                Support Email
              </Label>
              {isEditing ? (
                <Input
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  placeholder="support@feelitbuy.com"
                  className="mt-2"
                />
              ) : (
                <a
                  href={`mailto:${settings.support_email}`}
                  className="mt-2 text-indigo-600 hover:underline flex items-center gap-1"
                >
                  📧 {settings.support_email}
                </a>
              )}
            </div>

            <div>
              <Label htmlFor="support_phone" className="text-base font-semibold">
                Support Phone
              </Label>
              {isEditing ? (
                <Input
                  id="support_phone"
                  value={formData.support_phone}
                  onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                  className="mt-2"
                />
              ) : (
                <a
                  href={`tel:${settings.support_phone}`}
                  className="mt-2 text-indigo-600 hover:underline flex items-center gap-1"
                >
                  📞 {settings.support_phone}
                </a>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="return_days" className="text-base font-semibold">
                Return Policy Days
              </Label>
              {isEditing ? (
                <Input
                  id="return_days"
                  type="number"
                  value={formData.return_policy_days}
                  onChange={(e) => setFormData({ ...formData, return_policy_days: Number(e.target.value) })}
                  placeholder="30"
                  className="mt-2"
                />
              ) : (
                <p className="mt-2 text-gray-700">{settings.return_policy_days} days</p>
              )}
            </div>

            <div>
              <Label htmlFor="warranty_days" className="text-base font-semibold">
                Warranty Period (days)
              </Label>
              {isEditing ? (
                <Input
                  id="warranty_days"
                  type="number"
                  value={formData.warranty_days}
                  onChange={(e) => setFormData({ ...formData, warranty_days: Number(e.target.value) })}
                  placeholder="365"
                  className="mt-2"
                />
              ) : (
                <p className="mt-2 text-gray-700">{settings.warranty_days} days</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Preview */}
      {!isEditing && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold mb-4">Live Preview</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Company:</strong> {settings.company_name}
            </p>
            <p>
              <strong>Tagline:</strong> "{settings.tagline}"
            </p>
            <p>
              <strong>Support:</strong> {settings.support_email} | {settings.support_phone}
            </p>
            <p>
              <strong>Policies:</strong> {settings.return_policy_days}d returns, {settings.warranty_days}d warranty
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
