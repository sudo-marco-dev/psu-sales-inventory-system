'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Building2, Search } from 'lucide-react';

interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPerson || !formData.phone) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create supplier');
      }

      alert('Supplier added successfully!');
      setShowForm(false);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
      });
      fetchSuppliers();
    } catch (error: any) {
      alert(error.message || 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 mt-1">Manage your suppliers and vendors</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Supplier'}
        </Button>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Supplier'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search suppliers by name or contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No suppliers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try a different search term' : 'Get started by adding your first supplier.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {supplier.companyName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Contact Person:</dt>
                    <dd className="font-medium">{supplier.contactPerson}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phone:</dt>
                    <dd className="font-medium">{supplier.phone}</dd>
                  </div>
                  {supplier.email && (
                    <div>
                      <dt className="text-gray-500">Email:</dt>
                      <dd className="font-medium text-blue-600">{supplier.email}</dd>
                    </div>
                  )}
                  {supplier.address && (
                    <div>
                      <dt className="text-gray-500">Address:</dt>
                      <dd className="font-medium text-sm">{supplier.address}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Added:</dt>
                    <dd className="text-xs text-gray-400">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}