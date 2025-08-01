'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Separator } from '@workspace/ui/components/separator';
import { Switch } from '@workspace/ui/components/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  AlertTriangle,
  CreditCard,
  Lock,
  Mail,
  Shield,
  User,
  Users,
  Bell,
  Key,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import GeneralSettings from './settings/general-settings';
import TeamSettings from './settings/team-settings';
import SecuritySettings from './settings/security-settings';

interface UserData {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
  };
  profile: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    phone: string | null;
    timezone: string | null;
    language: string | null;
    companyName: string | null;
    companyWebsite: string | null;
    jobTitle: string | null;
  } | null;
}

interface TeamData {
  team: {
    id: number;
    name: string;
    createdAt: Date;
    teamMembers: Array<{
      id: number;
      role: string;
      joinedAt: Date;
      userId: number;
      user: {
        id: number;
        name: string | null;
        email: string;
        createdAt: Date;
      };
    }>;
  };
  currentUserRole: string;
  pendingInvitations: Array<{
    id: number;
    email: string;
    role: string;
    invitedAt: Date;
    invitedBy: {
      id: number;
      name: string | null;
      email: string;
    };
  }>;
}

interface SecurityData {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  securitySettings: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    securityAlerts: boolean;
    sessionTimeout: number;
    lastPasswordChange: Date | null;
  };
  activeSessions: Array<{
    id: number;
    deviceInfo: any;
    ipAddress: string | null;
    location: string | null;
    lastActivity: Date;
    createdAt: Date;
    isActive: boolean;
  }>;
  recentEvents: Array<{
    id: number;
    eventType: string;
    eventDetails: any;
    ipAddress: string | null;
    location: string | null;
    riskLevel: string;
    timestamp: Date;
  }>;
}

interface EnhancedSettingsProps {
  userData: UserData | null;
  teamData: TeamData | null;
  securityData: SecurityData | null;
}

// Enhanced Settings Page Component
export default function EnhancedSettings({ userData, teamData, securityData }: EnhancedSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      <div className='flex flex-col sm:gap-4 sm:py-4'>
        <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
          <div className='mx-auto grid w-full max-w-6xl gap-2'>
            <h1 className='text-3xl font-semibold'>Settings</h1>
            <p className='text-muted-foreground'>
              Manage your account settings and preferences.
            </p>
          </div>
          <div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[1fr] lg:grid-cols-[1fr]'>
            <div className='grid gap-6'>
              <Tabs defaultValue='general' className='w-full'>
                <TabsList className='grid w-full grid-cols-3 lg:grid-cols-6'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='security'>Security</TabsTrigger>
                  <TabsTrigger value='notifications'>Notifications</TabsTrigger>
                  <TabsTrigger value='billing'>Billing</TabsTrigger>
                  <TabsTrigger value='team' className='hidden lg:flex'>
                    Team
                  </TabsTrigger>
                  <TabsTrigger value='advanced' className='hidden lg:flex'>
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='general' className='space-y-6'>
                  <GeneralSettings userData={userData} />
                </TabsContent>

                <TabsContent value='team' className='space-y-6'>
                  <TeamSettings teamData={teamData} />
                </TabsContent>

                <TabsContent value='security' className='space-y-6'>
                  <SecuritySettings securityData={securityData} />
                </TabsContent>

                <TabsContent value='notifications' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Bell className='h-5 w-5' />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to be notified about important
                        updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-0.5'>
                            <div className='text-base'>Email Notifications</div>
                            <div className='text-sm text-muted-foreground'>
                              Receive notifications via email.
                            </div>
                          </div>
                          <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-0.5'>
                            <div className='text-base'>Push Notifications</div>
                            <div className='text-sm text-muted-foreground'>
                              Receive push notifications on your devices.
                            </div>
                          </div>
                          <Switch
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium'>
                          Email Preferences
                        </h4>
                        <div className='space-y-3'>
                          <div className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              id='marketing'
                              className='rounded'
                            />
                            <Label htmlFor='marketing' className='text-sm'>
                              Marketing emails
                            </Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              id='security'
                              className='rounded'
                              defaultChecked
                            />
                            <Label htmlFor='security' className='text-sm'>
                              Security alerts
                            </Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              id='product'
                              className='rounded'
                              defaultChecked
                            />
                            <Label htmlFor='product' className='text-sm'>
                              Product updates
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='billing' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <CreditCard className='h-5 w-5' />
                        Billing Information
                      </CardTitle>
                      <CardDescription>
                        Manage your subscription and billing details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='flex items-center justify-between p-4 border rounded-lg'>
                        <div>
                          <div className='font-medium'>Pro Plan</div>
                          <div className='text-sm text-muted-foreground'>
                            $29/month • Billed monthly
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='outline' size='sm'>
                            Change Plan
                          </Button>
                          <Button variant='outline' size='sm'>
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className='text-sm font-medium mb-4'>
                          Payment Method
                        </h4>
                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <CreditCard className='h-5 w-5' />
                            <div>
                              <div className='font-medium'>
                                •••• •••• •••• 4242
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                Expires 12/24
                              </div>
                            </div>
                          </div>
                          <Button variant='outline' size='sm'>
                            Update
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='team' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        Team Members
                      </CardTitle>
                      <CardDescription>
                        Invite and manage your team members.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex gap-2'>
                        <Input placeholder='Enter email address' />
                        <Button>Invite Member</Button>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between p-3 border rounded-lg'>
                          <div>
                            <div className='font-medium'>
                              john.doe@example.com
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              Owner
                            </div>
                          </div>
                          <Badge>You</Badge>
                        </div>
                        <div className='flex items-center justify-between p-3 border rounded-lg'>
                          <div>
                            <div className='font-medium'>
                              jane.smith@example.com
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              Admin
                            </div>
                          </div>
                          <Button variant='ghost' size='sm'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='advanced' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <AlertTriangle className='h-5 w-5 text-destructive' />
                        Danger Zone
                      </CardTitle>
                      <CardDescription>
                        Irreversible and destructive actions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='p-4 border border-destructive rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium text-destructive'>
                              Delete Account
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              Permanently delete your account and all associated
                              data.
                            </div>
                          </div>
                          <Button variant='destructive' size='sm'>
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
