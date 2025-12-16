import { useState } from "react";
import { AlertTriangle, Check, CheckCircle, Eye, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AINav } from "../components";
import {
  useAIAlerts,
  useMarkAlertRead,
  useAcknowledgeAlert,
  useMarkAllAlertsRead,
} from "../hooks/useAI";

function getSeverityVariant(
  severity: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case "CRITICAL":
    case "ERROR":
      return "destructive";
    case "WARNING":
      return "secondary";
    default:
      return "outline";
  }
}

export function AIAlertsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  
  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useAIAlerts({ unreadOnly });

  const markReadMutation = useMarkAlertRead();
  const acknowledgeMutation = useAcknowledgeAlert();
  const markAllReadMutation = useMarkAllAlertsRead();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading alerts</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load alerts"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AINav />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI usage alerts and warnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? "Show All" : "Show Unread Only"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAllRead()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            {alertsData?.totalElements || 0} alerts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading alerts...
                  </TableCell>
                </TableRow>
              ) : alertsData?.content?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alertsData?.content?.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell className="max-w-md truncate" title={alert.message}>
                      {alert.message}
                    </TableCell>
                    <TableCell>
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {alert.isRead ? (
                        <Badge variant="outline">Read</Badge>
                      ) : (
                        <Badge>Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkRead(alert.id)}
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!alert.acknowledgedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAcknowledge(alert.id)}
                            title="Acknowledge"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIAlertsPage;
