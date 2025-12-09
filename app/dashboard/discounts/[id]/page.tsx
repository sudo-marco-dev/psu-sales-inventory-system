'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    usageCount: 0,
    applicableFor: 'ALL',
    isActive: true,
  });

  useEffect(() => {
    fetchDiscount();
  }, []);

  const fetchDiscount = async () => {
    try {
      const res = await fetch(`/api/discounts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          code: data.code,
          name: data.name,
          description: data.description || '',
          discountType: data.discountType,
          discountValue: data.discountValue.toString(),
          minPurchase: data.minPurchase.toString(),
          maxDiscount: data.maxDiscount?.toString() || '',
          startDate: data.startDate.split('T')[0],
          endDate: data.endDate.split('T')[0],
          usageLimit: data.usageLimit?.toString() || '',
          usageCount: data.usageCount,
          applicableFor: data.applicableFor,
          isActive: data.isActive,
        });
      } else {
        alert('Discount not found');
        router.push('/dashboard/discounts');
      }
    } catch (error) {
      alert('Failed to load discount');
      router.push('/dashboard/discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountValue || !formData.endDate) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/discounts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update discount');
      }

      alert('Discount updated successfully!');
      router.push('/dashboard/discounts');
    } catch (error: any) {
      alert(error.message || 'Failed to update discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this discount? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/discounts/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Discount deleted successfully!');
        router.push('/dashboard/discounts');
      } else {
        throw new Error('Failed to delete discount');
      }
    } catch (error) {
      alert('Failed to delete discount');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/discounts">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Discount</h1>
            <p className="text-gray-500 mt-1">Update discount details</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Discount Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="SUMMER2025"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Customer will enter this code at checkout</p>
              </div>

              <div>
                <Label htmlFor="name">Discount Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Summer Sale 2025"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                rows={2}
                placeholder="Limited time offer for summer season"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage Off</option>
                  <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discountValue">
                  {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₱)'} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                />
              </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase">Minimum Purchase (₱)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum cart value required</p>
              </div>

              <div>
                <Label htmlFor="maxDiscount">Maximum Discount (₱)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="1000"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum discount amount (for percentage)</p>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
              </div>

              <div>
                <Label>Current Usage Count</Label>
                <div className="mt-1 p-2 bg-gray-100 rounded-md">
                  <p className="font-bold text-lg">{formData.usageCount}</p>
                  <p className="text-xs text-gray-500">Times used</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (uncheck to disable this discount)
              </Label>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Discount Preview</h3>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-mono font-bold text-xl">
                  {formData.code || 'CODE'}
                </div>
                <div>
                  <p className="font-bold text-2xl text-green-600">
                    {formData.discountType === 'PERCENTAGE'
                      ? `${formData.discountValue || '0'}% OFF`
                      : `₱${formData.discountValue || '0'} OFF`}
                  </p>
                  <p className="text-sm text-gray-600">{formData.name || 'Discount Name'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Used {formData.usageCount} times
                    {formData.usageLimit && ` (limit: ${formData.usageLimit})`}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/dashboard/discounts" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}