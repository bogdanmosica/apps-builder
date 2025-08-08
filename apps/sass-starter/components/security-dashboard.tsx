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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Fingerprint,
  Flag,
  Globe,
  History,
  Info,
  Key,
  Laptop,
  LineChart,
  Lock,
  Mail,
  MapPin,
  Minus,
  Monitor,
  MoreHorizontal,
  Network,
  PieChart,
  Plus,
  QrCode,
  RefreshCw,
  Scan,
  Search,
  Server,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

// Mock security data
const securityData = {
  overview: {
    securityScore: 92,
    activeThreats: 3,
    blockedAttacks: 1247,
    vulnerabilities: 2,
    complianceScore: 98,
    lastScan: "2024-03-25T14:30:00Z",
  },
  threats: [
    {
      id: "threat_001",
      type: "Brute Force Attack",
      severity: "high",
      status: "active",
      source: "192.168.1.100",
      target: "login endpoint",
      attempts: 47,
      blocked: true,
      firstSeen: "2024-03-25T13:45:00Z",
      lastSeen: "2024-03-25T14:32:00Z",
      geoLocation: "Russia",
    },
    {
      id: "threat_002",
      type: "SQL Injection",
      severity: "critical",
      status: "blocked",
      source: "203.0.113.42",
      target: "/api/users",
      attempts: 12,
      blocked: true,
      firstSeen: "2024-03-25T12:20:00Z",
      lastSeen: "2024-03-25T12:25:00Z",
      geoLocation: "China",
    },
    {
      id: "threat_003",
      type: "DDoS Attack",
      severity: "medium",
      status: "mitigated",
      source: "198.51.100.0/24",
      target: "web server",
      attempts: 2340,
      blocked: true,
      firstSeen: "2024-03-25T10:15:00Z",
      lastSeen: "2024-03-25T11:30:00Z",
      geoLocation: "Multiple",
    },
  ],
  vulnerabilities: [
    {
      id: "vuln_001",
      title: "Outdated SSL Certificate",
      description: "SSL certificate expires in 7 days",
      severity: "medium",
      category: "Certificate",
      affected: "web.acme-corp.com",
      discovered: "2024-03-25T09:00:00Z",
      status: "open",
      cvss: 5.3,
      remediation: "Renew SSL certificate before expiration",
    },
    {
      id: "vuln_002",
      title: "Weak Password Policy",
      description: "Password policy allows weak passwords",
      severity: "low",
      category: "Authentication",
      affected: "User registration system",
      discovered: "2024-03-24T15:30:00Z",
      status: "acknowledged",
      cvss: 3.1,
      remediation: "Implement stronger password requirements",
    },
  ],
  accessLogs: [
    {
      id: "log_001",
      user: "john.doe@acme-corp.com",
      action: "Login",
      resource: "/dashboard",
      timestamp: "2024-03-25T14:30:00Z",
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, US",
      status: "success",
      mfaUsed: true,
    },
    {
      id: "log_002",
      user: "admin@acme-corp.com",
      action: "API Access",
      resource: "/api/admin/users",
      timestamp: "2024-03-25T14:25:00Z",
      ipAddress: "192.168.1.10",
      userAgent: "curl/7.68.0",
      location: "San Francisco, US",
      status: "success",
      mfaUsed: true,
    },
    {
      id: "log_003",
      user: "jane.smith@acme-corp.com",
      action: "Failed Login",
      resource: "/auth/login",
      timestamp: "2024-03-25T14:20:00Z",
      ipAddress: "203.0.113.15",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      location: "London, UK",
      status: "failed",
      mfaUsed: false,
    },
  ],
  compliance: [
    {
      standard: "SOC 2",
      status: "compliant",
      score: 98,
      lastAudit: "2024-02-15T00:00:00Z",
      nextAudit: "2024-08-15T00:00:00Z",
      requirements: 125,
      passed: 123,
      failed: 2,
    },
    {
      standard: "GDPR",
      status: "compliant",
      score: 100,
      lastAudit: "2024-01-20T00:00:00Z",
      nextAudit: "2024-07-20T00:00:00Z",
      requirements: 47,
      passed: 47,
      failed: 0,
    },
    {
      standard: "HIPAA",
      status: "non-compliant",
      score: 72,
      lastAudit: "2024-03-01T00:00:00Z",
      nextAudit: "2024-06-01T00:00:00Z",
      requirements: 78,
      passed: 56,
      failed: 22,
    },
  ],
  settings: {
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventReuse: 12,
      maxAge: 90,
    },
    mfa: {
      required: true,
      methods: ["totp", "sms", "email"],
      backup: true,
    },
    sessionManagement: {
      timeout: 30,
      maxConcurrent: 3,
      rememberMe: false,
    },
    monitoring: {
      realTime: true,
      alerts: true,
      logging: "detailed",
      retention: 365,
    },
  },
};

function ThreatCard({ threat }: { threat: (typeof securityData.threats)[0] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "blocked":
        return "bg-green-100 text-green-800";
      case "mitigated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <Info className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(threat.severity)}
            <div>
              <h3 className="font-medium text-gray-900">{threat.type}</h3>
              <p className="text-sm text-gray-500">
                Source: {threat.source} → Target: {threat.target}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className={getSeverityColor(threat.severity)}>
              {threat.severity}
            </Badge>
            <Badge className={getStatusColor(threat.status)}>
              {threat.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Attempts:</span>
            <span className="font-medium ml-2">{threat.attempts}</span>
          </div>
          <div>
            <span className="text-gray-600">Location:</span>
            <span className="font-medium ml-2">{threat.geoLocation}</span>
          </div>
          <div>
            <span className="text-gray-600">First Seen:</span>
            <span className="font-medium ml-2">
              {new Date(threat.firstSeen).toLocaleTimeString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Seen:</span>
            <span className="font-medium ml-2">
              {new Date(threat.lastSeen).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-1">
            {threat.blocked ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-gray-600">
              {threat.blocked ? "Blocked" : "Active"}
            </span>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VulnerabilityRow({
  vulnerability,
}: {
  vulnerability: (typeof securityData.vulnerabilities)[0];
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "fixed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{vulnerability.title}</div>
          <div className="text-sm text-gray-500">
            {vulnerability.description}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getSeverityColor(vulnerability.severity)}>
          {vulnerability.severity}
        </Badge>
      </TableCell>
      <TableCell>{vulnerability.cvss}</TableCell>
      <TableCell>{vulnerability.category}</TableCell>
      <TableCell>{vulnerability.affected}</TableCell>
      <TableCell>
        <Badge className={getStatusColor(vulnerability.status)}>
          {vulnerability.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Details</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Update Status</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AccessLogRow({ log }: { log: (typeof securityData.accessLogs)[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{log.user}</div>
          <div className="text-sm text-gray-500">{log.action}</div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{log.resource}</TableCell>
      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
      <TableCell>{log.location}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
          {log.mfaUsed && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              MFA
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Button size="sm" variant="ghost">
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ComplianceCard({
  compliance,
}: {
  compliance: (typeof securityData.compliance)[0];
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800 border-green-200";
      case "non-compliant":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {compliance.standard}
          </h3>
          <Badge className={getStatusColor(compliance.status)}>
            {compliance.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Compliance Score</span>
              <span className="font-medium">{compliance.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${compliance.score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Passed:</span>
              <span className="font-medium text-green-600 ml-2">
                {compliance.passed}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Failed:</span>
              <span className="font-medium text-red-600 ml-2">
                {compliance.failed}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Audit:</span>
              <span className="font-medium ml-2">
                {new Date(compliance.lastAudit).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Next Audit:</span>
              <span className="font-medium ml-2">
                {new Date(compliance.nextAudit).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 pt-4 border-t">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SecurityDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [threatFilter, setThreatFilter] = useState("all");

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span>Security Dashboard</span>
            </h1>
            <p className="text-gray-600">
              Monitor security threats, vulnerabilities, and compliance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Security Report
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Scan
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Security Score
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {securityData.overview.securityScore}%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Threats
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {securityData.overview.activeThreats}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Blocked Attacks
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {securityData.overview.blockedAttacks.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Vulnerabilities
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {securityData.overview.vulnerabilities}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Compliance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {securityData.overview.complianceScore}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Scan</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(
                      securityData.overview.lastScan,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="access">Access Logs</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Threats
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search threats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={threatFilter} onValueChange={setThreatFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Threats</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {securityData.threats.map((threat) => (
                <ThreatCard key={threat.id} threat={threat} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vulnerability Management</CardTitle>
                    <CardDescription>
                      Track and manage security vulnerabilities
                    </CardDescription>
                  </div>
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vulnerability</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>CVSS</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Affected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityData.vulnerabilities.map((vulnerability) => (
                      <VulnerabilityRow
                        key={vulnerability.id}
                        vulnerability={vulnerability}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Access Logs</CardTitle>
                    <CardDescription>
                      Monitor user access and authentication events
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityData.accessLogs.map((log) => (
                      <AccessLogRow key={log.id} log={log} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {securityData.compliance.map((compliance) => (
                <ComplianceCard
                  key={compliance.standard}
                  compliance={compliance}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                  <CardDescription>
                    Configure password requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Length</Label>
                    <Input
                      type="number"
                      value={securityData.settings.passwordPolicy.minLength}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase</Label>
                    <Switch
                      checked={
                        securityData.settings.passwordPolicy.requireUppercase
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Lowercase</Label>
                    <Switch
                      checked={
                        securityData.settings.passwordPolicy.requireLowercase
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch
                      checked={
                        securityData.settings.passwordPolicy.requireNumbers
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Symbols</Label>
                    <Switch
                      checked={
                        securityData.settings.passwordPolicy.requireSymbols
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Password History</Label>
                    <Input
                      type="number"
                      value={securityData.settings.passwordPolicy.preventReuse}
                      className="w-20"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Multi-Factor Authentication</CardTitle>
                  <CardDescription>Configure MFA settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Require MFA</Label>
                    <Switch checked={securityData.settings.mfa.required} />
                  </div>
                  <div>
                    <Label>Allowed Methods</Label>
                    <div className="mt-2 space-y-2">
                      {["TOTP Authenticator", "SMS", "Email"].map(
                        (method, index) => (
                          <div
                            key={method}
                            className="flex items-center space-x-2"
                          >
                            <Switch
                              checked={securityData.settings.mfa.methods.includes(
                                ["totp", "sms", "email"][index],
                              )}
                            />
                            <Label>{method}</Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Codes</Label>
                    <Switch checked={securityData.settings.mfa.backup} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>Configure session settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securityData.settings.sessionManagement.timeout}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Max Concurrent Sessions</Label>
                    <Input
                      type="number"
                      value={
                        securityData.settings.sessionManagement.maxConcurrent
                      }
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow "Remember Me"</Label>
                    <Switch
                      checked={
                        securityData.settings.sessionManagement.rememberMe
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                  <CardDescription>
                    Configure monitoring and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Real-time Monitoring</Label>
                    <Switch
                      checked={securityData.settings.monitoring.realTime}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Security Alerts</Label>
                    <Switch checked={securityData.settings.monitoring.alerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Logging Level</Label>
                    <Select
                      defaultValue={securityData.settings.monitoring.logging}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="verbose">Verbose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log Retention (days)</Label>
                    <Input
                      type="number"
                      value={securityData.settings.monitoring.retention}
                      className="w-20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
