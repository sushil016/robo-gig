/**
 * User Profile Page
 * Displays user information and account settings
 */

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Mail, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    college: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name: user.name || "",
      college: user.college || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Login to view your profile</h1>
        <p className="mt-2 text-muted-foreground">Your account, orders, wishlist, and settings live here.</p>
        <Button asChild className="mt-6">
          <Link href="/login?redirect=/profile">Login</Link>
        </Button>
      </div>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updatedUser = await authApi.updateProfile({
        name: profileForm.name,
        college: profileForm.college,
        avatarUrl: profileForm.avatarUrl,
      });

      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {user.name || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="grid gap-4 pt-4">
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Full name"
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
                <input
                  value={profileForm.college}
                  onChange={(event) => setProfileForm((current) => ({ ...current, college: event.target.value }))}
                  placeholder="College or institution"
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
                <input
                  value={profileForm.avatarUrl}
                  onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  placeholder="Avatar image URL"
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
                <div className="flex gap-3">
                  <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save Profile"}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Information Grid */}
                <div className="grid gap-4 pt-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-sm text-muted-foreground">
                        {user.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">College/University</p>
                      <p className="text-sm text-muted-foreground">{user.college || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Account Role</p>
                      <p className="text-sm text-muted-foreground">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  <Button asChild variant="outline">
                    <Link href="/settings">Account Settings</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Additional Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Your saved items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/wishlist">View Wishlist</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
