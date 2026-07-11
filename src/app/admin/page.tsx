'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  MapPin,
  Wrench,
  Crosshair,
  Target,
  Ruler,
  Users,
  Trophy,
  Award,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface AdminSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const adminSections: AdminSection[] = [
  {
    title: 'Shooting Ranges',
    description: 'Manage shooting range locations',
    icon: <MapPin className="h-5 w-5" />,
    href: '/admin/ranges',
  },
  {
    title: 'Manufacturers',
    description: 'Manage firearm manufacturers',
    icon: <Wrench className="h-5 w-5" />,
    href: '/admin/manufacturers',
  },
  {
    title: 'Firearm Models',
    description: 'Manage firearm models by manufacturer',
    icon: <Crosshair className="h-5 w-5" />,
    href: '/admin/models',
  },
  {
    title: 'Calibres',
    description: 'Manage calibre types',
    icon: <Target className="h-5 w-5" />,
    href: '/admin/calibres',
  },
  {
    title: 'Target Types',
    description: 'Manage target definitions',
    icon: <Award className="h-5 w-5" />,
    href: '/admin/targets',
  },
  {
    title: 'Distances',
    description: 'Manage shooting distances',
    icon: <Ruler className="h-5 w-5" />,
    href: '/admin/distances',
  },
  {
    title: 'Users',
    description: 'Manage user accounts',
    icon: <Users className="h-5 w-5" />,
    href: '/admin/users',
  },
  {
    title: 'Competitions',
    description: 'Manage competitions',
    icon: <Trophy className="h-5 w-5" />,
    href: '/admin/competitions',
  },
  {
    title: 'Achievements',
    description: 'Manage achievement definitions',
    icon: <Award className="h-5 w-5" />,
    href: '/admin/achievements',
  },
  {
    title: 'Analytics',
    description: 'View system analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/admin/analytics',
  },
  {
    title: 'Settings',
    description: 'Application settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/admin/settings',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System management console
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {section.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {section.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}