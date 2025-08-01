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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  User,
  Settings,
  CreditCard,
  Shield,
  Users,
  Eye,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

// Mock activity data
const activities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'User logged in',
    target: 'Authentication',
    type: 'auth',
    severity: 'info',
    timestamp: '2024-03-25T10:30:00Z',
    ip: '192.168.1.100',
    userAgent: 'Chrome 122.0.0.0',
    details: { method: 'email', success: true },
  },
  {
    id: 2,
    user: 'Sarah Wilson',
    action: 'Created new team member',
    target: 'Team Management',
    type: 'team',
    severity: 'info',
    timestamp: '2024-03-25T10:25:00Z',
    ip: '192.168.1.101',
    userAgent: 'Firefox 124.0',
    details: { invitedEmail: 'new.member@company.com', role: 'Member' },
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'Updated subscription plan',
    target: 'Billing',
    type: 'billing',
    severity: 'info',
    timestamp: '2024-03-25T10:20:00Z',
    ip: '192.168.1.102',
    userAgent: 'Safari 17.3',
    details: { from: 'Basic', to: 'Pro', amount: 49.99 },
  },
  {
    id: 4,
    user: 'System',
    action: 'Failed login attempt',
    target: 'Authentication',
    type: 'security',
    severity: 'warning',
    timestamp: '2024-03-25T10:15:00Z',
    ip: '203.0.113.195',
    userAgent: 'Unknown Bot',
    details: { email: 'admin@company.com', attempts: 5 },
  },
  {
    id: 5,
    user: 'Emma Davis',
    action: 'Downloaded user data',
    target: 'Data Export',
    type: 'data',
    severity: 'info',
    timestamp: '2024-03-25T10:10:00Z',
    ip: '192.168.1.103',
    userAgent: 'Chrome 122.0.0.0',
    details: { format: 'CSV', records: 1250 },
  },
  {
    id: 6,
    user: 'Admin',
    action: 'Deleted user account',
    target: 'User Management',
    type: 'user',
    severity: 'critical',
    timestamp: '2024-03-25T10:05:00Z',
    ip: '192.168.1.104',
    userAgent: 'Chrome 122.0.0.0',
    details: {
      deletedUser: 'inactive.user@company.com',
      reason: 'GDPR Request',
    },
  },
  {
    id: 7,
    user: 'Lisa Brown',
    action: 'Updated profile settings',
    target: 'User Profile',
    type: 'profile',
    severity: 'info',
    timestamp: '2024-03-25T10:00:00Z',
    ip: '192.168.1.105',
    userAgent: 'Edge 122.0.0.0',
    details: { fields: ['name', 'email', 'preferences'] },
  },
  {
    id: 8,
    user: 'System',
    action: 'Backup completed',
    target: 'Database',
    type: 'system',
    severity: 'info',
    timestamp: '2024-03-25T09:55:00Z',
    ip: 'Internal',
    userAgent: 'System',
    details: { size: '2.3GB', duration: '15min' },
  },
];

const activityTypes = {
  auth: { icon: LogIn, color: 'bg-blue-100 text-blue-800' },
  team: { icon: Users, color: 'bg-green-100 text-green-800' },
  billing: { icon: CreditCard, color: 'bg-purple-100 text-purple-800' },
  security: { icon: Shield, color: 'bg-red-100 text-red-800' },
  data: { icon: Download, color: 'bg-orange-100 text-orange-800' },
  user: { icon: User, color: 'bg-gray-100 text-gray-800' },
  profile: { icon: Settings, color: 'bg-indigo-100 text-indigo-800' },
  system: { icon: Settings, color: 'bg-yellow-100 text-yellow-800' },
};

const severityIcons = {
  info: { icon: Info, color: 'text-blue-600' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600' },
  critical: { icon: XCircle, color: 'text-red-600' },
  success: { icon: CheckCircle, color: 'text-green-600' },
};

function ActivityRow({ activity }: { activity: (typeof activities)[0] }) {
  const ActivityIcon =
    activityTypes[activity.type as keyof typeof activityTypes]?.icon ||
    Settings;
  const SeverityIcon =
    severityIcons[activity.severity as keyof typeof severityIcons]?.icon ||
    Info;
  const activityColor =
    activityTypes[activity.type as keyof typeof activityTypes]?.color ||
    'bg-gray-100 text-gray-800';
  const severityColor =
    severityIcons[activity.severity as keyof typeof severityIcons]?.color ||
    'text-blue-600';

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <TableRow className='hover:bg-gray-50'>
      <TableCell>
        <div className='flex items-center space-x-3'>
          <SeverityIcon className={`h-4 w-4 ${severityColor}`} />
          <div>
            <div className='font-medium text-gray-900'>{activity.action}</div>
            <div className='text-sm text-gray-500'>{activity.target}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-2'>
          <User className='h-4 w-4 text-gray-400' />
          <span className='font-medium'>{activity.user}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${activityColor} text-xs`}>
          <ActivityIcon className='h-3 w-3 mr-1' />
          {activity.type}
        </Badge>
      </TableCell>
      <TableCell className='text-sm text-gray-600'>
        <div className='flex items-center space-x-1'>
          <Clock className='h-3 w-3' aria-hidden="true" />
          <span>{formatTimestamp(activity.timestamp)}</span>
        </div>
      </TableCell>
      <TableCell className='text-sm text-gray-600'>{activity.ip}</TableCell>
      <TableCell className='text-sm text-gray-600 max-w-32 truncate'>
        {activity.userAgent}
      </TableCell>
    </TableRow>
  );
}

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesSeverity =
      severityFilter === 'all' || activity.severity === severityFilter;

    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Activity Log</h1>
          <p className='text-gray-600'>
            Monitor all user activities and system events
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <Filter className='h-4 w-4 mr-2' />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Events
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {activities.length}
                </p>
              </div>
              <Activity className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Security Events
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {activities.filter((a) => a.type === 'security').length}
                </p>
              </div>
              <Shield className='h-8 w-8 text-red-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  User Actions
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {activities.filter((a) => a.user !== 'System').length}
                </p>
              </div>
              <User className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Critical Events
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {activities.filter((a) => a.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex-1 min-w-64'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search activities...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='auth'>Authentication</SelectItem>
                <SelectItem value='team'>Team</SelectItem>
                <SelectItem value='billing'>Billing</SelectItem>
                <SelectItem value='security'>Security</SelectItem>
                <SelectItem value='data'>Data</SelectItem>
                <SelectItem value='user'>User</SelectItem>
                <SelectItem value='profile'>Profile</SelectItem>
                <SelectItem value='system'>System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Severities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Severities</SelectItem>
                <SelectItem value='info'>Info</SelectItem>
                <SelectItem value='warning'>Warning</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
                <SelectItem value='success'>Success</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Time Range' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1h'>Last Hour</SelectItem>
                <SelectItem value='24h'>Last 24 Hours</SelectItem>
                <SelectItem value='7d'>Last 7 Days</SelectItem>
                <SelectItem value='30d'>Last 30 Days</SelectItem>
                <SelectItem value='90d'>Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Showing {filteredActivities.length} of {activities.length}{' '}
            activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
