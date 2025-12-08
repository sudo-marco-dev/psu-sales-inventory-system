'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, Upload, Shield, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  useEffect(() => {
    // Check last backup time
    const lastBackupTime = localStorage.getItem('lastBackupTime');
    if (lastBackupTime) {
      setLastBackup(lastBackupTime);
    }

    // Check if auto backup is enabled
    const autoBackup = localStorage.getItem('autoBackupEnabled');
    if (autoBackup !== null) {
      setAutoBackupEnabled(autoBackup === 'true');
    }

    // Check if daily backup is needed
    checkAndCreateDailyBackup();
  }, []);

  const checkAndCreateDailyBackup = async () => {
    if (!autoBackupEnabled) return;

    const lastBackupTime = localStorage.getItem('lastBackupTime');
    const today = new Date().toDateString();

    // If no backup today, create one automatically
    if (!lastBackupTime || new Date(lastBackupTime).toDateString() !== today) {
      await createBackup(true); // Silent backup
    }
  };

  const createBackup = async (silent = false) => {
    if (!silent) setBacking(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/backup/create', { method: 'POST' });
      
      if (!res.ok) {
        throw new Error('Failed to create backup');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      a.download = `psu-database-backup-${timestamp}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update last backup time
      const now = new Date().toISOString();
      localStorage.setItem('lastBackupTime', now);
      setLastBackup(now);

      if (!silent) {
        setMessage({ type: 'success', text: 'Database backup created successfully!' });
      }
    } catch (error) {
      console.error('Backup error:', error);
      if (!silent) {
        setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
      }
    } finally {
      if (!silent) setBacking(false);
    }
  };

  const handleBackup = () => createBackup(false);

  const handleRestoreClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!confirm(
        'WARNING: Restoring a backup will replace ALL current data. This action cannot be undone. Are you sure you want to continue?'
      )) {
        return;
      }

      setRestoring(true);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/backup/restore', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Failed to restore backup');
        }

        setMessage({ type: 'success', text: 'Database restored successfully! Please refresh the page.' });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Restore error:', error);
        setMessage({ type: 'error', text: 'Failed to restore backup. Please ensure the file is valid.' });
      } finally {
        setRestoring(false);
      }
    };
    input.click();
  };

  const toggleAutoBackup = () => {
    const newValue = !autoBackupEnabled;
    setAutoBackupEnabled(newValue);
    localStorage.setItem('autoBackupEnabled', newValue.toString());
    setMessage({ 
      type: 'success', 
      text: `Automated daily backups ${newValue ? 'enabled' : 'disabled'}` 
    });
  };

  const getBackupStatus = () => {
    if (!lastBackup) return { text: 'No backup created yet', color: 'text-gray-500', icon: Clock };
    
    const backupDate = new Date(lastBackup);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return { 
        text: `Last backup: ${backupDate.toLocaleString()}`, 
        color: 'text-green-600', 
        icon: CheckCircle 
      };
    } else if (diffHours < 48) {
      return { 
        text: `Last backup: ${backupDate.toLocaleString()}`, 
        color: 'text-orange-600', 
        icon: AlertTriangle 
      };
    } else {
      return { 
        text: `Last backup: ${backupDate.toLocaleString()} (Outdated)`, 
        color: 'text-red-600', 
        icon: AlertTriangle 
      };
    }
  };

  const backupStatus = getBackupStatus();
  const StatusIcon = backupStatus.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Manage database backups and system security</p>
      </div>

      {/* Alert Message */}
      {message && (
        <Card className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-5 w-5 ${backupStatus.color}`} />
              <div>
                <p className={`font-medium ${backupStatus.color}`}>{backupStatus.text}</p>
                <p className="text-xs text-gray-500 mt-1">Automated daily backups: {autoBackupEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAutoBackup}
              className={autoBackupEnabled ? 'border-green-600 text-green-600' : 'border-gray-400'}
            >
              {autoBackupEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {autoBackupEnabled && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Automated Daily Backups Active</p>
                <p>The system automatically creates a backup once per day. Backups are downloaded to your default download folder.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manual Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Section */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Create Backup Now
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Download a complete backup of your database. This includes all sales, products, purchases, suppliers, and users.
              Store this file in a safe location.
            </p>
            <Button
              onClick={handleBackup}
              disabled={backing}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {backing ? 'Creating Backup...' : 'Download Database Backup'}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-600">
              <Upload className="h-4 w-4" />
              Restore Backup
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Warning: Destructive Action</p>
                  <p className="text-sm text-orange-800">
                    Restoring a backup will <strong>permanently replace</strong> all current data in the system.
                    This action cannot be undone. Make sure you have a recent backup before proceeding.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRestoreClick}
              disabled={restoring}
              variant="outline"
              className="w-full md:w-auto border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              {restoring ? 'Restoring...' : 'Restore from Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">✅ Password Encryption</h4>
              <p className="text-gray-600">All user passwords are encrypted using bcrypt hashing (10 rounds).</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ Role-Based Access Control</h4>
              <p className="text-gray-600">Users can only access features authorized for their assigned role.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ SQL Injection Protection</h4>
              <p className="text-gray-600">All database queries use Prisma ORM for safe parameterized queries.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ Automated Backups</h4>
              <p className="text-gray-600">Daily automated backups help prevent data loss and ensure business continuity.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Automated Daily Backups:</strong> Enable automated backups to ensure daily protection.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Multiple Locations:</strong> Store backups in multiple secure locations (external drive, cloud storage).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Test Restores:</strong> Periodically test backup files to ensure they work correctly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Before Updates:</strong> Always create a backup before system updates or major changes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Retention:</strong> Keep at least 7 daily backups and 4 weekly backups.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}