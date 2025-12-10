'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Barcode, Printer, RefreshCw, Trash2, Check } from 'lucide-react';

interface BarcodeData {
  productId: string;
  productCode: string;
  productName: string;
  barcode: string | null;
  hasBarcode: boolean;
}

export default function ProductBarcodePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [barcodeData, setBarcodeData] = useState<BarcodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'EAN13' | 'Code128'>('EAN13');
  const [customBarcode, setCustomBarcode] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (productId) {
      fetchBarcodeData();
    }
  }, [productId]);

  const fetchBarcodeData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/barcode`);
      const data = await res.json();
      
      if (res.ok) {
        setBarcodeData(data);
        if (data.barcode) {
          setCustomBarcode(data.barcode);
        }
      } else {
        setError(data.error || 'Failed to load barcode data');
      }
    } catch (err) {
      setError('Failed to load barcode data');
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/products/${productId}/barcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcodeType,
          customBarcode: useCustom ? customBarcode : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Barcode generated successfully: ${data.barcode}`);
        await fetchBarcodeData();
      } else {
        setError(data.error || 'Failed to generate barcode');
      }
    } catch (err) {
      setError('Failed to generate barcode');
    } finally {
      setGenerating(false);
    }
  };

  const deleteBarcode = async () => {
    if (!confirm('Are you sure you want to remove this barcode?')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/products/${productId}/barcode`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Barcode removed successfully');
        await fetchBarcodeData();
      } else {
        setError(data.error || 'Failed to remove barcode');
      }
    } catch (err) {
      setError('Failed to remove barcode');
    } finally {
      setDeleting(false);
    }
  };

  const printLabel = () => {
    if (!barcodeData?.hasBarcode) {
      alert('Please generate a barcode first');
      return;
    }

    window.open(
      `/api/products/${productId}/barcode/print?includePrice=true&includeProductName=true&size=medium`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Barcode Management</h1>
          <p className="text-gray-500 mt-1">
            {barcodeData?.productName} ({barcodeData?.productCode})
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Barcode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Current Barcode
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barcodeData?.hasBarcode ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="font-mono text-2xl font-bold mb-2">
                    {barcodeData.barcode}
                  </div>
                  <div className="h-20 bg-white border border-gray-300 flex items-center justify-center">
                    {/* Simple barcode visualization */}
                    <div className="flex gap-[2px]">
                      {barcodeData.barcode?.split('').map((char, i) => (
                        <div
                          key={i}
                          className="w-1 bg-black"
                          style={{ height: `${20 + (char.charCodeAt(0) % 40)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={printLabel}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteBarcode}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Barcode className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No barcode generated yet</p>
                <p className="text-sm text-gray-400">Use the form to generate one</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Barcode */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Barcode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Barcode Type</Label>
                <select
                  value={barcodeType}
                  onChange={(e) => setBarcodeType(e.target.value as 'EAN13' | 'Code128')}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  disabled={useCustom}
                >
                  <option value="EAN13">EAN-13 (13 digits, international standard)</option>
                  <option value="Code128">Code 128 (Alphanumeric, uses product code)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {barcodeType === 'EAN13' 
                    ? 'Standard 13-digit barcode for retail products'
                    : 'Flexible barcode that supports letters and numbers'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustom"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useCustom">Use custom barcode</Label>
              </div>

              {useCustom && (
                <div>
                  <Label>Custom Barcode</Label>
                  <Input
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value)}
                    placeholder={barcodeType === 'EAN13' ? '1234567890123' : 'CUSTOM-001'}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {barcodeType === 'EAN13' && 'Must be exactly 13 digits with valid check digit'}
                  </p>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {success}
                </div>
              )}

              <Button
                className="w-full"
                onClick={generateBarcode}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Barcode className="mr-2 h-4 w-4" />
                    {barcodeData?.hasBarcode ? 'Regenerate Barcode' : 'Generate Barcode'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Barcode Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>EAN-13:</strong> The most common barcode for retail products worldwide.
              13 digits that include country code, manufacturer code, product code, and check digit.
            </div>
            <div>
              <strong>Code 128:</strong> A high-density barcode that can encode any ASCII character.
              Perfect for internal use and alphanumeric product codes.
            </div>
            <div className="border-t pt-2 mt-2">
              <strong>Note:</strong> Generated barcodes are unique across your system.
              Print labels and affix them to products for barcode scanner compatibility.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
