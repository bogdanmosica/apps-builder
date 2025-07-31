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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import { ConversationListSkeleton } from '@/components/conversation-skeleton';
import { StatsGridSkeleton } from '@/components/stats-skeleton';

// Icon mapping for dynamic stats
const iconMap = {
  MessageSquare,
  Users,
  Zap,
  Clock,
  Star,
  CheckCircle,
} as const;
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Archive,
  Reply,
  Forward,
  Paperclip,
  Phone,
  Video,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  UserPlus,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  Pin,
  Smile,
  AtSign,
  Hash,
  Volume2,
  VolumeX,
  Loader2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Types for API responses
interface CommunicationStats {
  unreadMessages: number;
  totalConversations: number;
  activeUsers: number;
  responseTime: string;
  satisfactionRate: number;
  ticketsResolved: number;
}

interface Conversation {
  id: number;
  participant: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'online' | 'away' | 'offline';
  conversationStatus?: 'active' | 'archived' | 'closed';
  type: 'support' | 'sales' | 'feedback';
  priority: 'low' | 'medium' | 'high';
}

interface Campaign {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'survey';
  status: 'draft' | 'scheduled' | 'sent' | 'active' | 'paused' | 'completed';
  recipients: number;
  openRate?: number;
  clickRate?: number;
  responseRate?: number;
  sentDate: string;
  template: string;
}

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  type: 'message' | 'campaign' | 'alert' | 'info';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface Template {
  id: number;
  name: string;
  type: 'email' | 'message' | 'notification' | 'sms';
  category: string;
  usage: number;
  lastModified: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  color: string;
  description?: string;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className='p-0'>
        {/* Header with Icon */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${color.includes('blue') ? 'from-blue-500/10 to-blue-600/20' : 
              color.includes('green') ? 'from-green-500/10 to-green-600/20' :
              color.includes('yellow') ? 'from-yellow-500/10 to-yellow-600/20' :
              color.includes('purple') ? 'from-purple-500/10 to-purple-600/20' :
              color.includes('orange') ? 'from-orange-500/10 to-orange-600/20' :
              'from-red-500/10 to-red-600/20'}`}>
              <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform duration-200`} />
            </div>
            {change && (
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                change.startsWith('+') ? 'bg-green-100 text-green-700' : 
                change.startsWith('-') ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-600'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${change.startsWith('-') ? 'rotate-180' : ''}`} />
                {change}
              </div>
            )}
          </div>
          
          {/* Title */}
          <h3 className='text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide'>
            {title}
          </h3>
        </div>

        {/* Main Value */}
        <div className="px-4 pb-2">
          <p className='text-3xl font-bold text-gray-900 leading-none group-hover:text-gray-700 transition-colors'>
            {value}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div className="px-4 pb-4">
            <p className='text-xs text-gray-500 leading-relaxed'>
              {description}
            </p>
          </div>
        )}
        
        {/* Bottom accent bar */}
        <div className={`h-1 bg-gradient-to-r ${
          color.includes('blue') ? 'from-blue-500 to-blue-600' : 
          color.includes('green') ? 'from-green-500 to-green-600' :
          color.includes('yellow') ? 'from-yellow-500 to-yellow-600' :
          color.includes('purple') ? 'from-purple-500 to-purple-600' :
          color.includes('orange') ? 'from-orange-500 to-orange-600' :
          'from-red-500 to-red-600'
        } group-hover:h-1.5 transition-all duration-200`} />
      </CardContent>
    </Card>
  );
}

function ConversationRow({
  conversation,
  onReply,
  onArchive,
  onDelete,
  onUnarchive,
  isArchived = false,
}: {
  conversation: Conversation;
  onReply: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onUnarchive?: () => void;
  isArchived?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const typeColors = {
    support: 'bg-blue-100 text-blue-800',
    sales: 'bg-purple-100 text-purple-800',
    feedback: 'bg-orange-100 text-orange-800',
  };

  const handleStar = () => {
    toast.success(`Starred conversation with ${conversation.participant}`);
  };

  return (
    <TableRow className={`${conversation.unread > 0 ? 'bg-blue-50' : ''} ${isArchived ? 'bg-gray-50 opacity-75' : ''}`}>
      <TableCell>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
              <span className='text-sm font-medium text-gray-700'>
                {conversation.participant
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </span>
            </div>
            <div
              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${statusColors[conversation.status]}`}
            />
          </div>
          <div>
            <div className='font-medium text-gray-900 flex items-center'>
              {conversation.participant}
              {conversation.conversationStatus === 'archived' && (
                <Badge variant='secondary' className='ml-2 text-xs'>
                  Archived
                </Badge>
              )}
              {conversation.conversationStatus === 'closed' && (
                <Badge variant='destructive' className='ml-2 text-xs'>
                  Closed
                </Badge>
              )}
            </div>
            <div className='text-sm text-gray-500'>{conversation.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className='max-w-xs truncate'>{conversation.lastMessage}</div>
      </TableCell>
      <TableCell>
        <Badge
          className={typeColors[conversation.type]}
        >
          {conversation.type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          className={priorityColors[conversation.priority]}
        >
          {conversation.priority}
        </Badge>
      </TableCell>
      <TableCell>
        {conversation.unread > 0 && (
          <Badge variant='default' className='bg-blue-500'>
            {conversation.unread}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className='text-sm text-gray-500'>
          {new Date(conversation.timestamp).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' onClick={() => setReplyOpen(true)}>
                <Reply className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' onClick={() => setVoiceCallOpen(true)}>
                <Phone className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice Call</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' onClick={() => setVideoCallOpen(true)}>
                <Video className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Call</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleStar}>
                <Star className='h-4 w-4 mr-2' />
                Star
              </DropdownMenuItem>
              {!isArchived ? (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className='h-4 w-4 mr-2' />
                  Archive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onUnarchive}>
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Unarchive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setForwardOpen(true)}>
                <Forward className='h-4 w-4 mr-2' />
                Forward
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600' onClick={onDelete}>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        <ReplyDialog 
          conversation={conversation} 
          open={replyOpen} 
          onOpenChange={setReplyOpen} 
        />
        <CallDialog 
          conversation={conversation} 
          type="voice" 
          open={voiceCallOpen} 
          onOpenChange={setVoiceCallOpen} 
        />
        <CallDialog 
          conversation={conversation} 
          type="video" 
          open={videoCallOpen} 
          onOpenChange={setVideoCallOpen} 
        />
        <ForwardDialog 
          conversation={conversation} 
          open={forwardOpen} 
          onOpenChange={setForwardOpen} 
        />
      </TableCell>
    </TableRow>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusColors = {
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    active: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-orange-100 text-orange-800',
    completed: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <h3 className='font-medium text-gray-900'>{campaign.name}</h3>
            <div className='flex items-center space-x-2 mt-1'>
              <Badge
                className={statusColors[campaign.status]}
              >
                {campaign.status}
              </Badge>
              <Badge variant='outline'>{campaign.type}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>
                <Eye className='h-4 w-4 mr-2' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className='h-4 w-4 mr-2' />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>Recipients:</span>
            <span className='font-medium'>
              {campaign.recipients.toLocaleString()}
            </span>
          </div>
          {campaign.openRate !== undefined && campaign.openRate > 0 && (
            <div className='flex justify-between'>
              <span className='text-gray-600'>Open Rate:</span>
              <span className='font-medium'>{campaign.openRate}%</span>
            </div>
          )}
          {campaign.clickRate !== undefined && campaign.clickRate > 0 && (
            <div className='flex justify-between'>
              <span className='text-gray-600'>Click Rate:</span>
              <span className='font-medium'>{campaign.clickRate}%</span>
            </div>
          )}
          {campaign.responseRate !== undefined && (
            <div className='flex justify-between'>
              <span className='text-gray-600'>Response Rate:</span>
              <span className='font-medium'>{campaign.responseRate}%</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span className='text-gray-600'>Date:</span>
            <span className='font-medium'>{campaign.sentDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItemComponent({
  notification,
}: {
  notification: NotificationItem;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className='h-5 w-5 text-blue-500' />;
      case 'campaign':
        return <Mail className='h-5 w-5 text-green-500' />;
      case 'alert':
        return <AlertCircle className='h-5 w-5 text-orange-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-500' />;
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
    >
      <div className='flex-shrink-0'>{getIcon(notification.type)}</div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <p
            className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <div className='w-2 h-2 bg-blue-500 rounded-full' />
          )}
        </div>
        <p className='text-sm text-gray-600'>{notification.description}</p>
        <div className='flex items-center justify-between mt-2'>
          <p className='text-xs text-gray-400'>
            {new Date(notification.timestamp).toLocaleDateString()}
          </p>
          <Button variant='ghost' size='sm' className='text-xs'>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

function ComposeMessageDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    type: '',
    priority: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.recipient || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 Sending message:', {
        recipient: formData.recipient,
        subject: formData.subject,
        messageLength: formData.message.length,
        type: formData.type,
        priority: formData.priority,
      });

      // Send email via API
      const response = await fetch('/api/communication/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      console.log('📨 API Response:', {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        // Create detailed error message
        let errorMessage = result.error || 'Failed to send message';
        if (result.details) {
          errorMessage += `: ${result.details}`;
        }
        if (result.resendError) {
          errorMessage += ` (${result.resendError})`;
        }
        
        console.error('❌ API Error:', {
          status: response.status,
          error: result.error,
          details: result.details,
          resendError: result.resendError,
          type: result.type,
        });
        
        throw new Error(errorMessage);
      }

      // Reset form and close dialog
      setFormData({
        recipient: '',
        subject: '',
        type: '',
        priority: '',
        message: '',
      });
      setOpen(false);
      
      // Show success message with email ID
      console.log('✅ Email sent successfully:', result);
      toast.success(`Message sent successfully!${result.messageId ? ` (ID: ${result.messageId})` : ''}`);
    } catch (error) {
      console.error('💥 Frontend Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      toast.error(`Email Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    toast.success('Draft saved successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a message to a customer or team member
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='recipient'>To *</Label>
            <Input 
              id='recipient' 
              placeholder='Enter email address...' 
              value={formData.recipient}
              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor='subject'>Subject *</Label>
            <Input 
              id='subject' 
              placeholder='Message subject...' 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='type'>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='support'>Support</SelectItem>
                  <SelectItem value='sales'>Sales</SelectItem>
                  <SelectItem value='feedback'>Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='priority'>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Select priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Low</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor='message'>Message *</Label>
            <Textarea
              id='message'
              placeholder='Type your message...'
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm'>
              <Paperclip className='h-4 w-4 mr-2' />
              Attach Files
            </Button>
            <Button variant='outline' size='sm'>
              <Smile className='h-4 w-4 mr-2' />
              Emoji
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleSaveDraft} disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Send className='h-4 w-4 mr-2' />
            )}
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    autoReply: true,
    emailNotifications: true,
    desktopNotifications: false,
    responseTimeTarget: '24',
    defaultPriority: 'medium',
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    signature: 'Best regards,\nYour Support Team',
  });

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // Here you would typically save to API
    toast.success('Settings saved successfully!');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings className='h-4 w-4 mr-2' />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Communication Settings</DialogTitle>
          <DialogDescription>
            Configure your communication preferences and settings
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-6'>
          {/* Notification Settings */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Notifications</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='autoReply'>Auto Reply</Label>
                  <p className='text-sm text-gray-500'>Automatically reply to new messages</p>
                </div>
                <Button
                  variant={settings.autoReply ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSettings({...settings, autoReply: !settings.autoReply})}
                >
                  {settings.autoReply ? 'On' : 'Off'}
                </Button>
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='emailNotifications'>Email Notifications</Label>
                  <p className='text-sm text-gray-500'>Receive email notifications for new messages</p>
                </div>
                <Button
                  variant={settings.emailNotifications ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                >
                  {settings.emailNotifications ? 'On' : 'Off'}
                </Button>
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='desktopNotifications'>Desktop Notifications</Label>
                  <p className='text-sm text-gray-500'>Show desktop notifications</p>
                </div>
                <Button
                  variant={settings.desktopNotifications ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSettings({...settings, desktopNotifications: !settings.desktopNotifications})}
                >
                  {settings.desktopNotifications ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          {/* Response Settings */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Response Settings</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='responseTime'>Response Time Target (hours)</Label>
                <Input
                  id='responseTime'
                  type='number'
                  value={settings.responseTimeTarget}
                  onChange={(e) => setSettings({...settings, responseTimeTarget: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor='defaultPriority'>Default Priority</Label>
                <Select 
                  value={settings.defaultPriority} 
                  onValueChange={(value) => setSettings({...settings, defaultPriority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Working Hours</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='startTime'>Start Time</Label>
                <Input
                  id='startTime'
                  type='time'
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings({
                    ...settings, 
                    workingHours: {...settings.workingHours, start: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label htmlFor='endTime'>End Time</Label>
                <Input
                  id='endTime'
                  type='time'
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings({
                    ...settings, 
                    workingHours: {...settings.workingHours, end: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          {/* Email Signature */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Email Signature</h3>
            <div>
              <Label htmlFor='signature'>Default Signature</Label>
              <Textarea
                id='signature'
                rows={4}
                value={settings.signature}
                onChange={(e) => setSettings({...settings, signature: e.target.value})}
                placeholder='Enter your default email signature...'
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            <Settings className='h-4 w-4 mr-2' />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReplyDialog({ conversation, open, onOpenChange }: {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [replyData, setReplyData] = useState({
    message: '',
    priority: conversation.priority,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyData.message.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/communication/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: conversation.email,
          subject: `Re: ${conversation.lastMessage.substring(0, 50)}...`,
          message: replyData.message,
          type: conversation.type,
          priority: replyData.priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      setReplyData({ message: '', priority: conversation.priority });
      onOpenChange(false);
      toast.success('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Reply to {conversation.participant}</DialogTitle>
          <DialogDescription>
            Replying to: {conversation.lastMessage.substring(0, 100)}...
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                <span className='text-sm font-medium'>
                  {conversation.participant.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className='font-medium'>{conversation.participant}</p>
                <p className='text-sm text-gray-500'>{conversation.email}</p>
              </div>
            </div>
            <p className='text-sm text-gray-700'>{conversation.lastMessage}</p>
          </div>
          
          <div>
            <Label htmlFor='priority'>Priority</Label>
            <Select value={replyData.priority} onValueChange={(value) => setReplyData({...replyData, priority: value as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='reply-message'>Your Reply</Label>
            <Textarea
              id='reply-message'
              placeholder='Type your reply...'
              rows={6}
              value={replyData.message}
              onChange={(e) => setReplyData({...replyData, message: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleReply} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Reply className='h-4 w-4 mr-2' />
            )}
            {isSubmitting ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CallDialog({ conversation, type, open, onOpenChange }: {
  conversation: Conversation;
  type: 'voice' | 'video';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [duration, setDuration] = useState(0);

  const startCall = () => {
    setCallStatus('calling');
    toast.success(`${type === 'voice' ? 'Voice' : 'Video'} call initiated to ${conversation.participant}`);
    
    // Simulate call connection after 3 seconds
    setTimeout(() => {
      setCallStatus('connected');
      
      // Start duration counter
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Auto-end call after 10 seconds for demo
      setTimeout(() => {
        clearInterval(interval);
        setCallStatus('ended');
        toast.info('Call ended');
      }, 10000);
    }, 3000);
  };

  const endCall = () => {
    setCallStatus('ended');
    toast.info('Call ended');
    setTimeout(() => {
      onOpenChange(false);
      setCallStatus('idle');
      setDuration(0);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            {type === 'voice' ? <Phone className='h-5 w-5 mr-2' /> : <Video className='h-5 w-5 mr-2' />}
            {type === 'voice' ? 'Voice' : 'Video'} Call
          </DialogTitle>
        </DialogHeader>
        
        <div className='text-center space-y-4'>
          <div className='mx-auto w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center'>
            <span className='text-xl font-medium text-gray-700'>
              {conversation.participant.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div>
            <h3 className='font-semibold text-lg'>{conversation.participant}</h3>
            <p className='text-sm text-gray-500'>{conversation.email}</p>
          </div>

          <div className='py-4'>
            {callStatus === 'idle' && (
              <p className='text-gray-600'>Ready to start {type} call</p>
            )}
            {callStatus === 'calling' && (
              <div className='flex items-center justify-center space-x-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <p className='text-blue-600'>Calling...</p>
              </div>
            )}
            {callStatus === 'connected' && (
              <div>
                <p className='text-green-600 mb-2'>Connected</p>
                <p className='text-2xl font-mono'>{formatDuration(duration)}</p>
              </div>
            )}
            {callStatus === 'ended' && (
              <p className='text-gray-600'>Call ended</p>
            )}
          </div>
        </div>

        <DialogFooter className='justify-center'>
          {callStatus === 'idle' && (
            <Button onClick={startCall} className='w-full'>
              {type === 'voice' ? <Phone className='h-4 w-4 mr-2' /> : <Video className='h-4 w-4 mr-2' />}
              Start {type === 'voice' ? 'Voice' : 'Video'} Call
            </Button>
          )}
          {(callStatus === 'calling' || callStatus === 'connected') && (
            <Button variant='destructive' onClick={endCall} className='w-full'>
              <Phone className='h-4 w-4 mr-2' />
              End Call
            </Button>
          )}
          {callStatus === 'ended' && (
            <Button variant='outline' onClick={() => onOpenChange(false)} className='w-full'>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ForwardDialog({ conversation, open, onOpenChange }: {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [forwardData, setForwardData] = useState({
    recipients: '',
    message: `Forwarding conversation from ${conversation.participant}:\n\n"${conversation.lastMessage}"`,
    addNote: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForward = async () => {
    if (!forwardData.recipients.trim()) {
      toast.error('Please enter recipient email addresses');
      return;
    }

    // Validate email addresses (support multiple emails separated by comma)
    const emailList = forwardData.recipients.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Send to each recipient
      const promises = emailList.map(async (recipient) => {
        const fullMessage = `${forwardData.message}\n\n${forwardData.addNote ? `Note: ${forwardData.addNote}` : ''}`;
        
        const response = await fetch('/api/communication/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: recipient.trim(),
            subject: `Forwarded: Conversation with ${conversation.participant}`,
            message: fullMessage,
            type: conversation.type,
            priority: conversation.priority,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(`Failed to forward to ${recipient}: ${result.error}`);
        }
        
        return response.json();
      });

      await Promise.all(promises);
      
      setForwardData({
        recipients: '',
        message: `Forwarding conversation from ${conversation.participant}:\n\n"${conversation.lastMessage}"`,
        addNote: '',
      });
      onOpenChange(false);
      toast.success(`Conversation forwarded to ${emailList.length} recipient(s)`);
    } catch (error) {
      console.error('Error forwarding conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to forward conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Forward Conversation</DialogTitle>
          <DialogDescription>
            Forward the conversation with {conversation.participant} to other recipients
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                <span className='text-sm font-medium'>
                  {conversation.participant.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className='font-medium'>{conversation.participant}</p>
                <p className='text-sm text-gray-500'>{conversation.email}</p>
              </div>
            </div>
            <p className='text-sm text-gray-700'>"{conversation.lastMessage}"</p>
          </div>
          
          <div>
            <Label htmlFor='recipients'>Recipients *</Label>
            <Input 
              id='recipients' 
              placeholder='Enter email addresses (comma-separated for multiple)' 
              value={forwardData.recipients}
              onChange={(e) => setForwardData({...forwardData, recipients: e.target.value})}
            />
            <p className='text-xs text-gray-500 mt-1'>
              Example: john@example.com, jane@example.com
            </p>
          </div>

          <div>
            <Label htmlFor='forward-message'>Message to Forward</Label>
            <Textarea
              id='forward-message'
              rows={4}
              value={forwardData.message}
              onChange={(e) => setForwardData({...forwardData, message: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor='add-note'>Additional Note (Optional)</Label>
            <Textarea
              id='add-note'
              placeholder='Add any additional context or notes...'
              rows={3}
              value={forwardData.addNote}
              onChange={(e) => setForwardData({...forwardData, addNote: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleForward} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Forward className='h-4 w-4 mr-2' />
            )}
            {isSubmitting ? 'Forwarding...' : 'Forward Conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunicationCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationFilter, setConversationFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState<'current' | 'archived'>('current');
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [statsConfig, setStatsConfig] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setConversationsLoading(true);
        const status = viewFilter === 'current' ? 'active' : 'archived';
        const [statsRes, conversationsRes, campaignsRes, notificationsRes, templatesRes] = await Promise.all([
          fetch('/api/communication/stats'),
          fetch(`/api/communication/conversations?status=${status}`),
          fetch('/api/communication/campaigns'),
          fetch('/api/communication/notifications'),
          fetch('/api/communication/templates'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
          setStatsConfig(statsData.statsConfig || []);
        }

        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          setConversations(conversationsData.conversations || []);
        }
        setConversationsLoading(false);

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setCampaigns(campaignsData.campaigns || []);
        }

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData.notifications || []);
        }

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData.templates || []);
        }
      } catch (err) {
        console.error('Error fetching communication data:', err);
        setError('Failed to load communication data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewFilter]);

  // Handle view filter changes with loading state
  const handleViewFilterChange = async (newFilter: 'current' | 'archived') => {
    if (newFilter === viewFilter) return; // Don't reload if same filter
    
    setViewFilter(newFilter);
    setConversationsLoading(true);
    
    try {
      const status = newFilter === 'current' ? 'active' : 'archived';
      const fetchedConversations = await fetchConversations(status);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Error changing view filter:', error);
      toast.error('Failed to load conversations');
    }
  };

  // Fetch conversations based on current view
  const fetchConversations = async (status: 'active' | 'archived' = 'active') => {
    try {
      setConversationsLoading(true);
      const response = await fetch(`/api/communication/conversations?status=${status}`);
      if (response.ok) {
        const data = await response.json();
        return data.conversations || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    } finally {
      setConversationsLoading(false);
    }
  };

  // Handle conversation actions with API calls
  const handleArchiveConversation = async (conversationId: number) => {
    try {
      setConversationsLoading(true);
      const response = await fetch(`/api/communication/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (response.ok) {
        // Remove from current conversations list
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        toast.success('Conversation archived successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to archive conversation');
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      setConversationsLoading(true);
      const response = await fetch(`/api/communication/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (response.ok) {
        // Remove from current list regardless of view
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        toast.success('Conversation deleted successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleUnarchiveConversation = async (conversationId: number) => {
    try {
      setConversationsLoading(true);
      const response = await fetch(`/api/communication/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        // Remove from current conversations list (which shows archived ones)
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        toast.success('Conversation restored to active conversations');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to restore conversation');
      }
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      toast.error('Failed to restore conversation');
    } finally {
      setConversationsLoading(false);
    }
  };
  // Filter conversations based on search, filter, and view
  const currentConversations = conversations.filter((conversation: any) => {
    const matchesFilter = conversationFilter === 'all' || conversation.type === conversationFilter;
    const matchesSearch = searchQuery === '' || 
      conversation.participant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const displayedConversations = currentConversations;

  const handleSeedData = async () => {
    try {
      const response = await fetch('/api/communication/seed', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh data after seeding
        window.location.reload();
      } else {
        console.error('Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading communication data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <div className='text-center'>
          <AlertCircle className='h-8 w-8 text-red-500 mx-auto mb-4' />
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={handleSeedData} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Seed Sample Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Communication Center
            </h1>
            <p className='text-gray-600'>
              Manage conversations, campaigns, and notifications
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <SettingsDialog />
            <ComposeMessageDialog />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
            <p className="text-gray-600">Real-time insights from your communication data</p>
          </div>
          
          {loading ? (
            <StatsGridSkeleton count={6} />
          ) : statsConfig.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6'>
              {statsConfig.map((statConfig) => {
                const IconComponent = iconMap[statConfig.icon as keyof typeof iconMap] || MessageSquare;
                return (
                  <StatCard
                    key={statConfig.id}
                    title={statConfig.title}
                    value={statConfig.value}
                    icon={IconComponent}
                    change={statConfig.change}
                    color={statConfig.color}
                    description={statConfig.description}
                  />
                );
              })}
            </div>
          ) : stats && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6'>
              <StatCard
                title='Unread Messages'
                value={stats.unreadMessages}
                icon={MessageSquare}
                color='text-blue-600'
              />
              <StatCard
                title='Conversations'
                value={stats.totalConversations}
              icon={Users}
              change='+8%'
              color='text-green-600'
            />
            <StatCard
              title='Active Users'
              value={stats.activeUsers}
              icon={Zap}
              color='text-yellow-600'
            />
            <StatCard
              title='Avg Response'
              value={stats.responseTime}
              icon={Clock}
              change='-12%'
              color='text-purple-600'
            />
            <StatCard
              title='Satisfaction'
              value={`${stats.satisfactionRate}%`}
              icon={Star}
              change='+3%'
              color='text-orange-600'
            />
            <StatCard
              title='Resolved'
              value={stats.ticketsResolved}
              icon={CheckCircle}
              change='+15%'
              color='text-red-600'
            />
          </div>
        )}
        </div>

        <Tabs defaultValue='conversations' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='conversations'>Conversations</TabsTrigger>
            <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            <TabsTrigger value='templates'>Templates</TabsTrigger>
          </TabsList>

          <TabsContent value='conversations' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>
                      {viewFilter === 'current' ? 'Active Conversations' : 'Archived Conversations'}
                    </CardTitle>
                    <CardDescription>
                      {viewFilter === 'current' 
                        ? 'Manage customer conversations and support tickets'
                        : 'View archived conversations'
                      }
                    </CardDescription>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {/* View Filter Toggle */}
                    <div className='flex items-center bg-gray-100 rounded-lg p-1'>
                      <Button
                        variant={viewFilter === 'current' ? 'default' : 'ghost'}
                        size='sm'
                        onClick={() => handleViewFilterChange('current')}
                        className='text-xs'
                        disabled={conversationsLoading}
                      >
                        Current ({currentConversations.length})
                      </Button>
                      <Button
                        variant={viewFilter === 'archived' ? 'default' : 'ghost'}
                        size='sm'
                        onClick={() => handleViewFilterChange('archived')}
                        className='text-xs'
                        disabled={conversationsLoading}
                      >
                        Archived ({viewFilter === 'archived' ? displayedConversations.length : (stats?.totalConversations || 0) - conversations.length})
                      </Button>
                    </div>
                    
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Search conversations...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10 w-64'
                      />
                    </div>
                    <Select
                      value={conversationFilter}
                      onValueChange={setConversationFilter}
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Types</SelectItem>
                        <SelectItem value='support'>Support</SelectItem>
                        <SelectItem value='sales'>Sales</SelectItem>
                        <SelectItem value='feedback'>Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {displayedConversations.length > 0 || conversationsLoading ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Last Message</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Unread</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>
                          {viewFilter === 'current' ? 'Actions' : 'Restore Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversationsLoading ? (
                        // Show skeleton rows while loading
                        <ConversationListSkeleton count={5} />
                      ) : (
                        displayedConversations.map((conversation) => (
                          <ConversationRow
                            key={conversation.id}
                            conversation={conversation}
                            onReply={() => console.log('Reply handled by internal dialog')}
                            onArchive={() => handleArchiveConversation(conversation.id)}
                            onDelete={() => handleDeleteConversation(conversation.id)}
                            onUnarchive={() => handleUnarchiveConversation(conversation.id)}
                            isArchived={viewFilter === 'archived'}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='text-center py-8'>
                    <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600'>
                      {viewFilter === 'current' ? 'No conversations found' : 'No archived conversations found'}
                    </p>
                    <Button onClick={handleSeedData} variant='outline' className='mt-4'>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Sample Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='campaigns' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Email Campaigns
                </h2>
                <p className='text-gray-600'>
                  Create and manage email marketing campaigns
                </p>
              </div>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                New Campaign
              </Button>
            </div>
            {campaigns.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className='text-center py-8'>
                  <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600'>No campaigns found</p>
                  <Button onClick={handleSeedData} variant='outline' className='mt-4'>
                    <Plus className='h-4 w-4 mr-2' />
                    Create Sample Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='notifications' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Notification Center</CardTitle>
                    <CardDescription>
                      Stay updated with important alerts and messages
                    </CardDescription>
                  </div>
                  <Button variant='outline' size='sm'>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Mark All Read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className='space-y-2'>
                    {notifications.map((notification) => (
                      <NotificationItemComponent
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <Bell className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600'>No notifications found</p>
                    <Button onClick={handleSeedData} variant='outline' className='mt-4'>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Sample Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='templates' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>
                      Pre-written templates for faster communication
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Usage Count</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className='font-medium'>
                            {template.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>{template.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant='secondary'>{template.category}</Badge>
                          </TableCell>
                          <TableCell>{template.usage}</TableCell>
                          <TableCell>{template.lastModified}</TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-1'>
                              <Button variant='ghost' size='sm'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='text-center py-8'>
                    <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600'>No templates found</p>
                    <Button onClick={handleSeedData} variant='outline' className='mt-4'>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Sample Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
