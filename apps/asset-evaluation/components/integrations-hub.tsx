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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Calendar,
  CheckCircle,
  Clock,
  Cloud,
  Code,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Github,
  Globe,
  Key,
  Layers,
  Link,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Network,
  Package,
  Pause,
  Play,
  Plug,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings,
  Shield,
  Slack,
  Terminal,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Webhook,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Types for integration data from API
interface IntegrationData {
  activeIntegrations: Array<{
    id: number;
    name: string;
    description: string;
    category: string;
    status: string;
    health: string;
    dataFlow: string;
    lastSync: string | null;
    config: any;
    events: number;
    errorRate: number;
  }>;
  apiMetrics: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    rateLimitHits: number;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      avgTime: number;
    }>;
  };
  webhooks: Array<{
    id: number;
    name: string;
    url: string;
    events: any;
    status: string;
    lastTriggered: string | null;
    retries: number;
    timeout: number;
    successRate: number;
  }>;
  apiKeys: Array<{
    id: number;
    name: string;
    description: string;
    permissions: any;
    environment: string;
    status: string;
    rateLimit: number;
    lastUsed: string | null;
    usage: number;
  }>;
  availableIntegrations: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    popularity: string;
    pricing: string;
    setupDifficulty: string;
  }>;
}

// Icon mapping function
const getIconForIntegration = (name: string, category: string) => {
  const integrationIcons: { [key: string]: any } = {
    Slack: Slack,
    GitHub: Github,
    Stripe: CreditCard,
    Mailgun: Mail,
    Zapier: Zap,
    "Google Analytics": BarChart3,
    HubSpot: Users,
    Notion: FileText,
  };

  if (integrationIcons[name]) {
    return integrationIcons[name];
  }

  // Fallback to category-based icons
  const categoryIcons: { [key: string]: any } = {
    Communication: MessageSquare,
    Development: Github,
    Payments: CreditCard,
    Email: Mail,
    Analytics: BarChart3,
    CRM: Users,
    Productivity: FileText,
    Automation: Zap,
  };

  return categoryIcons[category] || Plug;
};

// Mock integrations data
const integrationsData = {
  activeIntegrations: [
    {
      id: "slack_001",
      name: "Slack",
      description: "Team communication and notifications",
      category: "Communication",
      status: "connected",
      icon: Slack,
      lastSync: "2024-03-25T14:30:00Z",
      dataFlow: "bidirectional",
      events: 234,
      errorRate: 0.2,
      health: "healthy",
      config: {
        workspace: "acme-corp",
        channels: ["#general", "#alerts", "#sales"],
        notifications: true,
      },
    },
    {
      id: "github_001",
      name: "GitHub",
      description: "Code repository and deployment tracking",
      category: "Development",
      status: "connected",
      icon: Github,
      lastSync: "2024-03-25T14:25:00Z",
      dataFlow: "inbound",
      events: 89,
      errorRate: 0.0,
      health: "healthy",
      config: {
        repository: "acme-corp/saas-app",
        branches: ["main", "develop"],
        webhooks: ["push", "pull_request"],
      },
    },
    {
      id: "stripe_001",
      name: "Stripe",
      description: "Payment processing and subscription management",
      category: "Payments",
      status: "connected",
      icon: CreditCard,
      lastSync: "2024-03-25T14:32:00Z",
      dataFlow: "bidirectional",
      events: 156,
      errorRate: 1.2,
      health: "warning",
      config: {
        mode: "live",
        webhooks: ["payment_intent.succeeded", "customer.subscription.updated"],
        currencies: ["USD", "EUR"],
      },
    },
    {
      id: "mailgun_001",
      name: "Mailgun",
      description: "Email delivery and marketing automation",
      category: "Email",
      status: "error",
      icon: Mail,
      lastSync: "2024-03-25T13:45:00Z",
      dataFlow: "outbound",
      events: 45,
      errorRate: 15.8,
      health: "error",
      config: {
        domain: "mail.acme-corp.com",
        region: "us",
        suppressions: true,
      },
    },
  ],
  availableIntegrations: [
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows between apps",
      category: "Automation",
      icon: Zap,
      popularity: "high",
      pricing: "freemium",
      setupDifficulty: "easy",
    },
    {
      id: "google_analytics",
      name: "Google Analytics",
      description: "Web analytics and user behavior tracking",
      category: "Analytics",
      icon: BarChart3,
      popularity: "high",
      pricing: "free",
      setupDifficulty: "medium",
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "CRM and marketing automation platform",
      category: "CRM",
      icon: Users,
      popularity: "medium",
      pricing: "freemium",
      setupDifficulty: "medium",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Collaborative workspace and documentation",
      category: "Productivity",
      icon: FileText,
      popularity: "medium",
      pricing: "freemium",
      setupDifficulty: "easy",
    },
  ],
  webhooks: [
    {
      id: "webhook_001",
      name: "User Registration Webhook",
      url: "https://api.acme-corp.com/webhooks/user-registered",
      events: ["user.created", "user.updated"],
      status: "active",
      lastTriggered: "2024-03-25T14:20:00Z",
      successRate: 98.5,
      retries: 3,
      timeout: 30,
    },
    {
      id: "webhook_002",
      name: "Payment Success Webhook",
      url: "https://api.acme-corp.com/webhooks/payment-success",
      events: ["payment.succeeded", "subscription.created"],
      status: "active",
      lastTriggered: "2024-03-25T14:18:00Z",
      successRate: 99.8,
      retries: 5,
      timeout: 15,
    },
    {
      id: "webhook_003",
      name: "Analytics Webhook",
      url: "https://analytics.acme-corp.com/events",
      events: ["page.viewed", "feature.used"],
      status: "paused",
      lastTriggered: "2024-03-24T16:30:00Z",
      successRate: 95.2,
      retries: 2,
      timeout: 10,
    },
  ],
  apiKeys: [
    {
      id: "api_key_001",
      name: "Production API Key",
      description: "Main production environment key",
      permissions: ["read", "write", "admin"],
      lastUsed: "2024-03-25T14:30:00Z",
      usage: 8547,
      rateLimit: 10000,
      environment: "production",
      status: "active",
    },
    {
      id: "api_key_002",
      name: "Mobile App Key",
      description: "Mobile application API access",
      permissions: ["read", "write"],
      lastUsed: "2024-03-25T14:25:00Z",
      usage: 3421,
      rateLimit: 5000,
      environment: "production",
      status: "active",
    },
    {
      id: "api_key_003",
      name: "Development Key",
      description: "Development and testing environment",
      permissions: ["read", "write"],
      lastUsed: "2024-03-25T12:15:00Z",
      usage: 1234,
      rateLimit: 1000,
      environment: "development",
      status: "active",
    },
  ],
  apiMetrics: {
    totalRequests: 45230,
    successRate: 99.2,
    avgResponseTime: 180,
    rateLimitHits: 23,
    topEndpoints: [
      { endpoint: "/api/users", requests: 12430, avgTime: 120 },
      { endpoint: "/api/auth", requests: 8970, avgTime: 90 },
      { endpoint: "/api/billing", requests: 6540, avgTime: 240 },
      { endpoint: "/api/analytics", requests: 4320, avgTime: 150 },
    ],
  },
};

function IntegrationCard({
  integration,
  onConfigure,
  onToggle,
  onDelete,
}: {
  integration: IntegrationData["activeIntegrations"][0];
  onConfigure: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const IconComponent = getIconForIntegration(
    integration.name,
    integration.category,
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {integration.name}
              </h3>
              <p className="text-sm text-gray-500">{integration.description}</p>
            </div>
          </div>
          <Badge className={getStatusBadge(integration.status)}>
            {integration.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{integration.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data Flow:</span>
            <span className="font-medium capitalize">
              {integration.dataFlow}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Events (24h):</span>
            <span className="font-medium">{integration.events || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Error Rate:</span>
            <span
              className={`font-medium ${getHealthColor(integration.health)}`}
            >
              {integration.errorRate || 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">
              {integration.lastSync
                ? new Date(integration.lastSync).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${getHealthColor(integration.health).replace("text-", "bg-")}`}
            />
            <span className="text-sm text-gray-600 capitalize">
              {integration.health}
            </span>
          </div>
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onConfigure}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configure</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sync Now</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onToggle}>
                  {integration.status === "connected" ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {integration.status === "connected" ? "Pause" : "Resume"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Integration</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailableIntegrationCard({
  integration,
  onInstall,
  isRecommended = false,
}: {
  integration: IntegrationData["availableIntegrations"][0];
  onInstall: () => void;
  isRecommended?: boolean;
}) {
  const IconComponent = getIconForIntegration(
    integration.name,
    integration.category,
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case "high":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-purple-100 text-purple-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isRecommended ? "ring-2 ring-blue-500 bg-blue-50/50" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground">
                  {integration.name}
                </h3>
                {isRecommended && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{integration.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="outline">{integration.category}</Badge>
          <Badge className={getPopularityColor(integration.popularity)}>
            {integration.popularity} popularity
          </Badge>
          <Badge className={getDifficultyColor(integration.setupDifficulty)}>
            {integration.setupDifficulty} setup
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 capitalize">
            {integration.pricing} pricing
          </span>
          <Button
            size="sm"
            onClick={onInstall}
            className={isRecommended ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookRow({ webhook }: { webhook: IntegrationData["webhooks"][0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{webhook.name}</div>
          <div className="text-sm text-gray-500 font-mono">{webhook.url}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {Array.isArray(webhook.events)
            ? webhook.events.map((event) => (
                <Badge key={event} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))
            : null}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(webhook.status)}>
          {webhook.status}
        </Badge>
      </TableCell>
      <TableCell>{webhook.successRate}%</TableCell>
      <TableCell>
        {webhook.lastTriggered
          ? new Date(webhook.lastTriggered).toLocaleDateString()
          : "Never"}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Test</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy URL</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

function APIKeyRow({ apiKey }: { apiKey: IntegrationData["apiKeys"][0] }) {
  const [showKey, setShowKey] = useState(false);
  const maskedKey = `${apiKey.id.toString().slice(0, 8)}${"*".repeat(20)}`;

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{apiKey.name}</div>
          <div className="text-sm text-gray-500">{apiKey.description}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {showKey ? apiKey.id.toString() : maskedKey}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {Array.isArray(apiKey.permissions)
            ? apiKey.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))
            : null}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>
            {apiKey.usage?.toLocaleString() || 0} /{" "}
            {apiKey.rateLimit?.toLocaleString() || 0}
          </div>
          <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-blue-600 h-1 rounded-full"
              style={{
                width: `${((apiKey.usage || 0) / (apiKey.rateLimit || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            apiKey.environment === "production" ? "default" : "secondary"
          }
        >
          {apiKey.environment}
        </Badge>
      </TableCell>
      <TableCell>
        {apiKey.lastUsed
          ? new Date(apiKey.lastUsed).toLocaleDateString()
          : "Never"}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Key</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function IntegrationsHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [integrationsData, setIntegrationsData] =
    useState<IntegrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [installIntegrationName, setInstallIntegrationName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    dataFlow: "",
  });

  // Fetch integrations data
  useEffect(() => {
    const fetchIntegrationsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/integrations");
        if (!response.ok) {
          throw new Error("Failed to fetch integrations data");
        }
        const data = await response.json();
        setIntegrationsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching integrations data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrationsData();
  }, []);

  // Seed data if no integrations exist
  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/integrations/seed", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to seed integrations data");
      }
      const result = await response.json();
      toast.success("Sample integrations data created successfully!");

      // Refresh data
      const refreshResponse = await fetch("/api/integrations");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setIntegrationsData(data);
      }
    } catch (err) {
      toast.error("Failed to create sample data");
      console.error("Error seeding data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add integration
  const handleAddIntegration = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      dataFlow: "",
    });
    setIsAddDialogOpen(true);
  };

  // Handle form submission for new integration
  const handleSubmitIntegration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.category || !formData.dataFlow) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const integrationData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        dataFlow: formData.dataFlow,
        config: {},
      };

      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(integrationData),
      });

      if (!response.ok) {
        throw new Error("Failed to create integration");
      }

      toast.success("Integration created successfully!");
      setIsAddDialogOpen(false);

      // Reset form data
      setFormData({
        name: "",
        description: "",
        category: "",
        dataFlow: "",
      });

      // Refresh data
      const refreshResponse = await fetch("/api/integrations");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setIntegrationsData(data);
      }
    } catch (err) {
      toast.error("Failed to create integration");
      console.error("Error creating integration:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete integration
  const handleDeleteIntegration = async (
    integrationId: number,
    integrationName: string,
  ) => {
    setIntegrationToDelete({ id: integrationId, name: integrationName });
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete integration
  const confirmDeleteIntegration = async () => {
    if (!integrationToDelete) return;

    try {
      const response = await fetch(
        `/api/integrations/${integrationToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete integration");
      }

      toast.success("Integration deleted successfully!");
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);

      // Refresh data
      const refreshResponse = await fetch("/api/integrations");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setIntegrationsData(data);
      }
    } catch (err) {
      toast.error("Failed to delete integration");
      console.error("Error deleting integration:", err);
    }
  };

  // Handle export config
  const handleExportConfig = () => {
    if (!integrationsData) return;

    const config = {
      integrations: integrationsData.activeIntegrations.map((integration) => ({
        name: integration.name,
        category: integration.category,
        status: integration.status,
        config: integration.config,
      })),
      webhooks: integrationsData.webhooks.map((webhook) => ({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        status: webhook.status,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `integrations-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle install integration
  const handleInstallIntegration = (integrationName: string) => {
    setInstallIntegrationName(integrationName);
    setIsInstallDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">
              Loading integrations...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Integrations
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no data or empty integrations, show seed option
  if (!integrationsData || integrationsData.activeIntegrations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Network className="h-8 w-8 text-blue-600" />
              <span>Integrations Hub</span>
            </h1>
            <p className="text-gray-600">
              Connect and manage third-party integrations and APIs
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Integrations Found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating some sample integrations data
            </p>
            <Button onClick={handleSeedData}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sample Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Network className="h-8 w-8 text-blue-600" />
              <span>Integrations Hub</span>
            </h1>
            <p className="text-gray-600">
              Connect and manage third-party integrations and APIs
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportConfig}>
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button size="sm" onClick={handleAddIntegration}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Integrations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrationsData.activeIntegrations.length}
                  </p>
                </div>
                <Plug className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    API Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrationsData.apiMetrics.totalRequests.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrationsData.apiMetrics.successRate}%
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
                  <p className="text-sm font-medium text-gray-600">
                    Avg Response
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {integrationsData.apiMetrics.avgResponseTime}ms
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Active Integrations</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api">API Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Connected Integrations
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrationsData.activeIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={() => console.log("Configure", integration.name)}
                  onToggle={() => console.log("Toggle", integration.name)}
                  onDelete={() =>
                    handleDeleteIntegration(integration.id, integration.name)
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Integrations
              </h3>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Browse All
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Show Stripe first as a recommended integration */}
              <AvailableIntegrationCard
                key="stripe-recommended"
                integration={{
                  id: "stripe",
                  name: "Stripe",
                  description:
                    "Payment processing and subscription management (Recommended)",
                  category: "Payments",
                  popularity: "high",
                  pricing: "per-transaction",
                  setupDifficulty: "easy",
                }}
                onInstall={() => handleInstallIntegration("Stripe")}
                isRecommended={true}
              />
              {integrationsData.availableIntegrations.map((integration) => (
                <AvailableIntegrationCard
                  key={integration.id}
                  integration={integration}
                  onInstall={() => handleInstallIntegration(integration.name)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Management</CardTitle>
                    <CardDescription>
                      Configure and monitor incoming/outgoing webhooks
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrationsData.webhooks.map((webhook) => (
                      <WebhookRow key={webhook.id} webhook={webhook} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Key Management</CardTitle>
                    <CardDescription>
                      Manage API keys, permissions, and usage limits
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrationsData.apiKeys.map((apiKey) => (
                      <APIKeyRow key={apiKey.id} apiKey={apiKey} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top API Endpoints</CardTitle>
                  <CardDescription>
                    Most frequently accessed endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationsData.apiMetrics.topEndpoints.map(
                      (endpoint, index) => (
                        <div
                          key={endpoint.endpoint}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium font-mono text-sm">
                              {endpoint.endpoint}
                            </div>
                            <div className="text-xs text-gray-500">
                              {endpoint.requests.toLocaleString()} requests
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {endpoint.avgTime}ms
                            </div>
                            <div className="text-xs text-gray-500">
                              avg response
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Health</CardTitle>
                  <CardDescription>
                    Status overview of all integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationsData.activeIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              integration.health === "healthy"
                                ? "bg-green-500"
                                : integration.health === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium">
                            {integration.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {integration.errorRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            error rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Integration Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // Reset form when dialog is closed
              setFormData({
                name: "",
                description: "",
                category: "",
                dataFlow: "",
              });
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Create a new integration to connect with external services.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitIntegration} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Slack, GitHub, Stripe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of what this integration does"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Payments">Payments</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Automation">Automation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFlow">Data Flow</Label>
                <Select
                  value={formData.dataFlow}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, dataFlow: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data flow direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive data)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Send data)
                    </SelectItem>
                    <SelectItem value="bidirectional">
                      Bidirectional (Send & Receive)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Integration
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Install Integration Dialog */}
        <Dialog
          open={isInstallDialogOpen}
          onOpenChange={setIsInstallDialogOpen}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Install Integration</DialogTitle>
              <DialogDescription>
                Set up the {installIntegrationName} integration to connect with
                external services.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                The {installIntegrationName} integration setup process would
                guide you through:
              </p>
              <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>API key configuration</li>
                <li>Connection testing</li>
                <li>Data mapping setup</li>
                <li>Webhook configuration</li>
              </ul>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInstallDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsInstallDialogOpen(false);
                  // Here you would start the actual integration setup process
                }}
              >
                Start Setup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setIntegrationToDelete(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Delete Integration</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the{" "}
                <strong>{integrationToDelete?.name}</strong> integration? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">
                      This will permanently delete:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Integration configuration and settings</li>
                      <li>All associated API requests history</li>
                      <li>Connected webhooks and deliveries</li>
                      <li>API keys and access tokens</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteIntegration}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
