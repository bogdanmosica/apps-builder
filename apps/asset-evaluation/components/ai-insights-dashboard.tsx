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
  Bot,
  Brain,
  BrainCircuit,
  ChartArea,
  CheckCircle,
  Clock,
  Cloud,
  Cpu,
  Database,
  DollarSign,
  Download,
  Eye,
  Filter,
  Globe,
  Info,
  Layers,
  Lightbulb,
  MessageSquare,
  MoreHorizontal,
  Network,
  Pause,
  PieChart,
  Play,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  Wand2,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

// Mock AI/ML data
const aiInsightsData = {
  modelPerformance: {
    userChurnPrediction: {
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.5,
      f1Score: 90.6,
      lastTrained: "2024-03-25T10:30:00Z",
      status: "active",
    },
    revenueForecasting: {
      accuracy: 87.3,
      mape: 8.2, // Mean Absolute Percentage Error
      r2Score: 0.89,
      lastTrained: "2024-03-24T14:15:00Z",
      status: "active",
    },
    contentRecommendation: {
      accuracy: 92.1,
      clickThroughRate: 15.8,
      engagement: 23.4,
      lastTrained: "2024-03-23T09:45:00Z",
      status: "training",
    },
  },
  predictions: [
    {
      id: 1,
      type: "churn_risk",
      userId: "user_12345",
      userName: "John Doe",
      email: "john@example.com",
      riskLevel: "high",
      probability: 0.89,
      factors: ["Decreased usage", "No recent logins", "Support tickets"],
      recommendedActions: [
        "Send retention email",
        "Offer discount",
        "Personal outreach",
      ],
      createdAt: "2024-03-25T08:30:00Z",
    },
    {
      id: 2,
      type: "upsell_opportunity",
      userId: "user_67890",
      userName: "Jane Smith",
      email: "jane@example.com",
      riskLevel: "high",
      probability: 0.76,
      factors: [
        "Heavy feature usage",
        "Plan limits reached",
        "Growth trajectory",
      ],
      recommendedActions: [
        "Suggest plan upgrade",
        "Schedule demo",
        "Show ROI calculator",
      ],
      createdAt: "2024-03-25T07:15:00Z",
    },
    {
      id: 3,
      type: "engagement_drop",
      userId: "user_11111",
      userName: "Mike Johnson",
      email: "mike@example.com",
      riskLevel: "medium",
      probability: 0.64,
      factors: [
        "Login frequency decreased",
        "Feature usage dropped",
        "Session time reduced",
      ],
      recommendedActions: [
        "Send onboarding tips",
        "Feature usage guide",
        "Check-in email",
      ],
      createdAt: "2024-03-25T06:45:00Z",
    },
  ],
  insights: [
    {
      id: 1,
      title: "Revenue Growth Acceleration",
      description:
        "AI models predict 34% revenue increase in Q2 based on current user behavior patterns",
      confidence: 0.91,
      impact: "high",
      category: "revenue",
      actionable: true,
      recommendation:
        "Focus marketing efforts on enterprise segment to maximize predicted growth",
      createdAt: "2024-03-25T10:00:00Z",
    },
    {
      id: 2,
      title: "Feature Adoption Opportunity",
      description:
        "Advanced analytics feature has 78% lower adoption than predicted optimal rate",
      confidence: 0.87,
      impact: "medium",
      category: "product",
      actionable: true,
      recommendation:
        "Create in-app tutorials and improve feature discoverability",
      createdAt: "2024-03-25T09:30:00Z",
    },
    {
      id: 3,
      title: "Customer Support Efficiency",
      description:
        "AI chatbot can handle 65% more queries with current training data",
      confidence: 0.93,
      impact: "medium",
      category: "support",
      actionable: true,
      recommendation:
        "Expand chatbot knowledge base and enable more automated responses",
      createdAt: "2024-03-25T09:00:00Z",
    },
  ],
  automationRules: [
    {
      id: 1,
      name: "High Churn Risk Alert",
      description:
        "Automatically send retention campaigns to users with >80% churn probability",
      status: "active",
      trigger: "Churn probability > 0.80",
      actions: [
        "Send email template: retention_high_risk",
        "Notify account manager",
        "Add to priority list",
      ],
      lastTriggered: "2024-03-25T08:30:00Z",
      triggerCount: 23,
    },
    {
      id: 2,
      name: "Upsell Opportunity Notification",
      description: "Alert sales team when users show high upgrade potential",
      status: "active",
      trigger: "Upsell probability > 0.70 AND plan usage > 80%",
      actions: [
        "Create sales task",
        "Send upgrade suggestion",
        "Schedule follow-up",
      ],
      lastTriggered: "2024-03-25T07:15:00Z",
      triggerCount: 15,
    },
    {
      id: 3,
      name: "Content Recommendation Engine",
      description:
        "Automatically suggest personalized content based on user behavior",
      status: "active",
      trigger: "User login AND content engagement score calculated",
      actions: [
        "Update recommendation feed",
        "Send personalized newsletter",
        "Update UI recommendations",
      ],
      lastTriggered: "2024-03-25T10:45:00Z",
      triggerCount: 1247,
    },
  ],
  aiModels: [
    {
      id: "churn_v2",
      name: "Customer Churn Prediction v2.1",
      type: "classification",
      framework: "TensorFlow",
      status: "production",
      accuracy: 94.2,
      lastTrained: "2024-03-25T10:30:00Z",
      trainingData: "Last 12 months user behavior",
      features: [
        "login_frequency",
        "feature_usage",
        "support_tickets",
        "billing_history",
      ],
      nextTraining: "2024-04-01T00:00:00Z",
    },
    {
      id: "revenue_forecast",
      name: "Revenue Forecasting Model",
      type: "regression",
      framework: "scikit-learn",
      status: "production",
      accuracy: 87.3,
      lastTrained: "2024-03-24T14:15:00Z",
      trainingData: "Historical revenue and user metrics",
      features: ["user_growth", "churn_rate", "mrr", "seasonality"],
      nextTraining: "2024-03-31T00:00:00Z",
    },
    {
      id: "content_recommender",
      name: "Content Recommendation Engine",
      type: "recommendation",
      framework: "PyTorch",
      status: "training",
      accuracy: 92.1,
      lastTrained: "2024-03-23T09:45:00Z",
      trainingData: "User interactions and content metadata",
      features: [
        "content_type",
        "user_preferences",
        "engagement_history",
        "time_patterns",
      ],
      nextTraining: "2024-03-26T02:00:00Z",
    },
  ],
};

function ModelPerformanceCard({ model, name }: { model: any; name: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <span className="font-medium">{model.accuracy}%</span>
          </div>
          {model.precision && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Precision</span>
              <span className="font-medium">{model.precision}%</span>
            </div>
          )}
          {model.mape && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">MAPE</span>
              <span className="font-medium">{model.mape}%</span>
            </div>
          )}
          {model.clickThroughRate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CTR</span>
              <span className="font-medium">{model.clickThroughRate}%</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground border-t pt-2">
            Last trained: {new Date(model.lastTrained).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PredictionCard({
  prediction,
}: {
  prediction: (typeof aiInsightsData.predictions)[0];
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "churn_risk":
        return <AlertTriangle className="h-4 w-4" />;
      case "upsell_opportunity":
        return <TrendingUp className="h-4 w-4" />;
      case "engagement_drop":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getTypeIcon(prediction.type)}
            <div>
              <h3 className="font-medium text-foreground">
                {prediction.userName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {prediction.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getRiskColor(prediction.riskLevel)}>
              {prediction.riskLevel} risk
            </Badge>
            <div className="text-sm font-medium text-foreground mt-1">
              {(prediction.probability * 100).toFixed(0)}% probability
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Risk Factors
            </h4>
            <div className="flex flex-wrap gap-1">
              {prediction.factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Recommended Actions
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {prediction.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {new Date(prediction.createdAt).toLocaleDateString()}
          </span>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              Take Action
            </Button>
            <Button size="sm" variant="ghost">
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  insight,
}: {
  insight: (typeof aiInsightsData.insights)[0];
}) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "revenue":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "product":
        return <Rocket className="h-4 w-4 text-blue-600" />;
      case "support":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(insight.category)}
            <h3 className="font-medium text-foreground">{insight.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getImpactColor(insight.impact)}>
              {insight.impact} impact
            </Badge>
            <div className="text-sm text-muted-foreground">
              {(insight.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {insight.description}
        </p>

        {insight.actionable && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Recommendation
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {insight.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              Implement
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModelManagementTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Model</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Framework</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Accuracy</TableHead>
          <TableHead>Last Trained</TableHead>
          <TableHead>Next Training</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {aiInsightsData.aiModels.map((model) => (
          <TableRow key={model.id}>
            <TableCell>
              <div>
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-muted-foreground">
                  ID: {model.id}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{model.type}</Badge>
            </TableCell>
            <TableCell>{model.framework}</TableCell>
            <TableCell>
              <Badge
                className={
                  model.status === "production"
                    ? "bg-green-100 text-green-800"
                    : model.status === "training"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }
              >
                {model.status}
              </Badge>
            </TableCell>
            <TableCell>{model.accuracy}%</TableCell>
            <TableCell>
              {new Date(model.lastTrained).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {new Date(model.nextTraining).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retrain Model</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Model Settings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Model</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AIInsightsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span>AI Insights Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              AI-powered predictions, insights, and automation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </div>

        {/* Model Performance Overview */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Model Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModelPerformanceCard
              model={aiInsightsData.modelPerformance.userChurnPrediction}
              name="Churn Prediction"
            />
            <ModelPerformanceCard
              model={aiInsightsData.modelPerformance.revenueForecasting}
              name="Revenue Forecasting"
            />
            <ModelPerformanceCard
              model={aiInsightsData.modelPerformance.contentRecommendation}
              name="Content Recommendations"
            />
          </div>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="models">Model Management</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Active Predictions
                </h3>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="churn_risk">Churn Risk</SelectItem>
                      <SelectItem value="upsell_opportunity">
                        Upsell Opportunity
                      </SelectItem>
                      <SelectItem value="engagement_drop">
                        Engagement Drop
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aiInsightsData.predictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  AI-Generated Insights
                </h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Insights
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aiInsightsData.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  Automated actions triggered by AI predictions and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsightsData.automationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Bot className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-foreground">
                              {rule.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              rule.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }
                          >
                            {rule.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">
                            Trigger
                          </h5>
                          <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs font-mono">
                            {rule.trigger}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">
                            Actions
                          </h5>
                          <ul className="text-gray-600 space-y-1">
                            {rule.actions.map((action, index) => (
                              <li
                                key={index}
                                className="flex items-center space-x-1"
                              >
                                <Zap className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                        <span>
                          Last triggered:{" "}
                          {new Date(rule.lastTriggered).toLocaleDateString()}
                        </span>
                        <span>Triggered {rule.triggerCount} times</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Automation Rule
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ML Model Management</CardTitle>
                    <CardDescription>
                      Monitor, retrain, and manage your machine learning models
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy New Model
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ModelManagementTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
