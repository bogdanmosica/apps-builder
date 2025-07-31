'use client';

import { useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
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
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Trash2, 
  Shield, 
  Mail,
  Calendar,
  Crown,
  Eye,
  Settings2,
  Clock,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { 
  inviteTeamMember, 
  updateMemberRole, 
  removeMember,
  cancelInvitation 
} from '@/lib/actions/team-settings';
import { toast } from 'sonner';

interface TeamMember {
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
}

interface PendingInvitation {
  id: number;
  email: string;
  role: string;
  invitedAt: Date;
  invitedBy: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface TeamData {
  team: {
    id: number;
    name: string;
    createdAt: Date;
    teamMembers: TeamMember[];
  };
  currentUserRole: string;
  pendingInvitations: PendingInvitation[];
}

interface TeamSettingsProps {
  teamData: TeamData | null;
}

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye,
};

export default function TeamSettings({ teamData }: TeamSettingsProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isPendingInvite, startTransitionInvite] = useTransition();
  const [isPendingRole, startTransitionRole] = useTransition();
  const [isPendingRemove, startTransitionRemove] = useTransition();
  const [isPendingCancel, startTransitionCancel] = useTransition();

  if (!teamData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No team found</p>
            <p className="text-sm text-muted-foreground mt-1">
              You may need to create or join a team first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canManageTeam = ['admin', 'owner'].some(role => 
    teamData.currentUserRole?.includes(role)
  );

  const handleInviteMember = async (formData: FormData) => {
    startTransitionInvite(async () => {
      const result = await inviteTeamMember(formData);
      if (result.success) {
        toast.success(result.message);
        setIsInviteDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    const formData = new FormData();
    formData.append('memberId', memberId.toString());
    formData.append('role', newRole);

    startTransitionRole(async () => {
      const result = await updateMemberRole(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemoveMember = async (memberId: number) => {
    const formData = new FormData();
    formData.append('memberId', memberId.toString());

    startTransitionRemove(async () => {
      const result = await removeMember(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCancelInvitation = async (invitationId: number) => {
    const formData = new FormData();
    formData.append('invitationId', invitationId.toString());

    startTransitionCancel(async () => {
      const result = await cancelInvitation(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || Users;
    return <IconComponent className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {teamData.team.name}
              </CardTitle>
              <CardDescription>
                Manage your team members and their permissions.
              </CardDescription>
            </div>
            {canManageTeam && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={handleInviteMember}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="colleague@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" defaultValue="member">
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">
                              <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                Viewer - Read-only access
                              </div>
                            </SelectItem>
                            <SelectItem value="member">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Member - Standard access
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Admin - Full management access
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPendingInvite}>
                        {isPendingInvite ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created on {formatDate(teamData.team.createdAt)} • {teamData.team.teamMembers.length} members
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Current members of your team and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamData.team.teamMembers.map((member) => {
              const isCurrentUser = member.user.email === member.user.email; // This should be checked against current user
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-medium">
                      {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.name || 'No name'}
                        {/* Add current user indicator here if needed */}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {member.user.email}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.member} flex items-center gap-1`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                    
                    {canManageTeam && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'viewer')}
                            disabled={member.role === 'viewer' || isPendingRole}
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'member')}
                            disabled={member.role === 'member' || isPendingRole}
                          >
                            <Users className="mr-2 h-3 w-3" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, 'admin')}
                            disabled={member.role === 'admin' || member.role === 'owner' || isPendingRole}
                          >
                            <Shield className="mr-2 h-3 w-3" />
                            Make Admin
                          </DropdownMenuItem>
                          {member.role !== 'owner' && (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setMemberToRemove(member);
                                setConfirmRemoveDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Remove Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {teamData.pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamData.pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Invited as {invitation.role} by {invitation.invitedBy.name || invitation.invitedBy.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(invitation.invitedAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                    {canManageTeam && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={isPendingCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Removing Members */}
      <Dialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name || memberToRemove?.user.email} from the team? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmRemoveDialogOpen(false);
                setMemberToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (memberToRemove) {
                  handleRemoveMember(memberToRemove.id);
                  setConfirmRemoveDialogOpen(false);
                  setMemberToRemove(null);
                }
              }}
              disabled={isPendingRemove}
            >
              {isPendingRemove ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
