'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';



export default function LoginPage() {

  const router = useRouter();

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');

    setLoading(true);



    try {

      const res = await fetch('/api/auth/login', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username, password }),

      });



      const data = await res.json();



      if (!res.ok) {

        setError(data.error || 'Login failed');

        setLoading(false);

        return;

      }



      // Store user in localStorage (for MVP only)

      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');

    } catch (err) {

      setError('An error occurred. Please try again.');

      setLoading(false);

    }

  };



  const handleDemoUser = (userType: 'admin' | 'cashier' | 'clerk') => {

    switch (userType) {

      case 'admin':

        setUsername('admin');

        setPassword('admin123');

        break;

      case 'cashier':

        setUsername('cashier');

        setPassword('cashier123');

        break;

      case 'clerk':

        setUsername('clerk');

        setPassword('clerk123');

        break;

    }

  };



      return (



        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">



          <Card className="w-full max-w-md">



            <CardHeader className="space-y-1">



              <CardTitle className="text-2xl font-bold text-center">PSU Sales & Inventory</CardTitle>



              <CardDescription className="text-center">



                Palawan State University



              </CardDescription>



            </CardHeader>



            <CardContent>



              <form onSubmit={handleSubmit} className="space-y-4">



                <div className="space-y-2">



                  <Label htmlFor="username">Username</Label>



                  <Input



                    id="username"



                    type="text"



                    placeholder="Enter username"



                    value={username}



                    onChange={(e) => setUsername(e.target.value)}



                    required



                    disabled={loading}



                  />



                </div>



                <div className="space-y-2">



                  <Label htmlFor="password">Password</Label>



                  <Input



                    id="password"



                    type="password"



                    placeholder="Enter password"



                    value={password}



                    onChange={(e) => setPassword(e.target.value)}



                    required



                    disabled={loading}



                  />



                </div>



                {error && (



                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">



                    {error}



                  </div>



                )}



                <Button type="submit" className="w-full" disabled={loading}>



                  {loading ? 'Logging in...' : 'Sign In'}



                </Button>



              </form>



              <div className="mt-6">



                <p className="text-sm text-center text-gray-500 mb-2">Credential Account</p>



                <div className="grid grid-cols-3 gap-2">



                                <Button variant="outline" size="xs" onClick={() => handleDemoUser('admin')}>Admin</Button>



                                <Button variant="outline" size="xs" onClick={() => handleDemoUser('cashier')}>Cashier</Button>



                                <Button variant="outline" size="xs" onClick={() => handleDemoUser('clerk')}>Clerk</Button>



                </div>



              </div>



            </CardContent>



          </Card>



        </div>



      );



    }
