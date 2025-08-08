"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  Key,
  Lock,
  MapPin,
  Monitor,
  MoreHorizontal,
  QrCode,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  changePassword,
  disable2FA,
  enable2FA,
  revokeAllSessions,
  revokeSession,
  updateSecuritySettings,
  verify2FA,
} from "@/lib/actions/security-settings";

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

interface SecuritySettingsProps {
  securityData: SecurityData | null;
}

const EVENT_ICONS = {
  login: CheckCircle,
  failed_login: XCircle,
  password_change: Lock,
  "2fa_enabled": Shield,
  "2fa_disabled": Shield,
  session_revoked: Monitor,
  all_sessions_revoked: RefreshCw,
};

const RISK_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function SecuritySettings({
  securityData,
}: SecuritySettingsProps) {
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [twoFAData, setTwoFAData] = useState<any>(null);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [sessionToRemove, setSessionToRemove] = useState<number | null>(null);

  const [isPendingPassword, startTransitionPassword] = useTransition();
  const [isPending2FA, startTransition2FA] = useTransition();
  const [isPendingSettings, startTransitionSettings] = useTransition();
  const [isPendingSession, startTransitionSession] = useTransition();

  if (!securityData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Failed to load security data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePasswordChange = async (formData: FormData) => {
    startTransitionPassword(async () => {
      const result = await changePassword(formData);
      if (result.success) {
        toast.success(result.message);
        // Reset form
        const form = document.getElementById(
          "password-form",
        ) as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleEnable2FA = async () => {
    startTransition2FA(async () => {
      const result = await enable2FA();
      if (result.success) {
        setTwoFAData(result);
        setShow2FASetup(true);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleVerify2FA = async (formData: FormData) => {
    if (!twoFAData) return;

    // Add secret to form data
    formData.append("secret", twoFAData.secret);

    startTransition2FA(async () => {
      const result = await verify2FA(formData);
      if (result.success) {
        toast.success(result.message);
        setShow2FASetup(false);
        setTwoFAData(null);
        if (result.recoveryCodes) {
          setRecoveryCodes(result.recoveryCodes);
          setShowRecoveryCodes(true);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDisable2FA = async (formData: FormData) => {
    startTransition2FA(async () => {
      const result = await disable2FA(formData);
      if (result.success) {
        toast.success(result.message);
        setShow2FADisable(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdateSettings = async (formData: FormData) => {
    startTransitionSettings(async () => {
      const result = await updateSecuritySettings(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRevokeSession = async (sessionId: number) => {
    const formData = new FormData();
    formData.append("sessionId", sessionId.toString());

    startTransitionSession(async () => {
      const result = await revokeSession(formData);
      if (result.success) {
        toast.success(result.message);
        setConfirmRemoveDialog(false);
        setSessionToRemove(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRevokeAllSessions = async () => {
    startTransitionSession(async () => {
      const result = await revokeAllSessions();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getEventIcon = (eventType: string) => {
    const IconComponent =
      EVENT_ICONS[eventType as keyof typeof EVENT_ICONS] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="password-form"
            action={handlePasswordChange}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isPendingPassword}>
                {isPendingPassword ? "Updating..." : "Update Password"}
              </Button>
              <div className="text-sm text-muted-foreground">
                Last changed:{" "}
                {securityData.securitySettings.lastPasswordChange
                  ? formatDate(securityData.securitySettings.lastPasswordChange)
                  : "Never changed"}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-base">2FA Status</div>
              <div className="text-sm text-muted-foreground">
                {securityData.securitySettings.twoFactorEnabled
                  ? "Two-factor authentication is enabled"
                  : "Two-factor authentication is disabled"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  securityData.securitySettings.twoFactorEnabled
                    ? "default"
                    : "outline"
                }
                className={
                  securityData.securitySettings.twoFactorEnabled
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {securityData.securitySettings.twoFactorEnabled ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </>
                )}
              </Badge>
              {securityData.securitySettings.twoFactorEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShow2FADisable(true)}
                  disabled={isPending2FA}
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleEnable2FA}
                  disabled={isPending2FA}
                >
                  {isPending2FA ? "Setting up..." : "Enable 2FA"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Preferences</CardTitle>
          <CardDescription>
            Configure your security notifications and session settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdateSettings} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Login Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when someone signs into your account
                  </div>
                </div>
                <Switch
                  name="loginNotifications"
                  defaultChecked={
                    securityData.securitySettings.loginNotifications
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Security Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified about suspicious account activity
                  </div>
                </div>
                <Switch
                  name="securityAlerts"
                  defaultChecked={securityData.securitySettings.securityAlerts}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Select
                  name="sessionTimeout"
                  defaultValue={securityData.securitySettings.sessionTimeout.toString()}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isPendingSettings}>
              {isPendingSettings ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </div>
            {securityData.activeSessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllSessions}
                disabled={isPendingSession}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Revoke All
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData.activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active sessions found
              </p>
            ) : (
              securityData.activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {session.deviceInfo?.browser || "Unknown Browser"} on{" "}
                        {session.deviceInfo?.os || "Unknown OS"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        {session.ipAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.ipAddress}
                          </span>
                        )}
                        {session.location && <span>{session.location}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active: {formatDate(session.lastActivity)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      Active
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSessionToRemove(session.id);
                            setConfirmRemoveDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          Revoke Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Your recent security-related account activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityData.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent security events
              </p>
            ) : (
              securityData.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {event.eventType.replace("_", " ")}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          RISK_COLORS[
                            event.riskLevel as keyof typeof RISK_COLORS
                          ]
                        }
                      >
                        {event.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{formatDate(event.timestamp)}</span>
                      {event.ipAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.ipAddress}
                        </span>
                      )}
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the code to
              verify.
            </DialogDescription>
          </DialogHeader>

          {twoFAData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={twoFAData.qrCode}
                  alt="2FA QR Code"
                  className="border rounded"
                />
              </div>

              <div className="space-y-2">
                <Label>Manual Entry Key</Label>
                <div className="flex items-center gap-2">
                  <Input value={twoFAData.manualEntryKey} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(twoFAData.manualEntryKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form action={handleVerify2FA}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Verification Code</Label>
                    <Input
                      id="token"
                      name="token"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShow2FASetup(false);
                        setTwoFAData(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending2FA}>
                      {isPending2FA ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Dialog */}
      <Dialog open={show2FADisable} onOpenChange={setShow2FADisable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA. This will make your account
              less secure.
            </DialogDescription>
          </DialogHeader>
          <form action={handleDisable2FA}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShow2FADisable(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isPending2FA}
                >
                  {isPending2FA ? "Disabling..." : "Disable 2FA"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recovery Codes Dialog */}
      <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recovery Codes</DialogTitle>
            <DialogDescription>
              Save these recovery codes in a safe place. They can be used to
              access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded font-mono text-sm">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <AlertTriangle className="h-4 w-4" />
              These codes will only be shown once. Make sure to save them now.
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const codesText = recoveryCodes.join("\n");
                const blob = new Blob([codesText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "recovery-codes.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Codes
            </Button>
            <Button onClick={() => setShowRecoveryCodes(false)}>
              I've Saved Them
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Removal Confirmation */}
      <Dialog open={confirmRemoveDialog} onOpenChange={setConfirmRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? The user will be
              signed out immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmRemoveDialog(false);
                setSessionToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (sessionToRemove) {
                  handleRevokeSession(sessionToRemove);
                }
              }}
              disabled={isPendingSession}
            >
              {isPendingSession ? "Revoking..." : "Revoke Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
