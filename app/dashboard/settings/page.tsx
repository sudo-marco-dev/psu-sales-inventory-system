'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, Upload, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = async () => {
    setBacking(true);
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
      a.download = `psu-database-backup-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Database backup created successfully!' });
    } catch (error) {
      console.error('Backup error:', error);
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    } finally {
      setBacking(false);
    }
  };

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

      {/* Database Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Section */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Create Backup
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
              <h4 className="font-semibold mb-1">✅ Session Management</h4>
              <p className="text-gray-600">User sessions are managed securely with local storage validation.</p>
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
              <span><strong>Daily Backups:</strong> Create backups at the end of each business day.</span>
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