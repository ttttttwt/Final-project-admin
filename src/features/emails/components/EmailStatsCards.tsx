/**
 * Email Stats Cards Component
 * Displays email statistics in card format
 */

import {
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailStatsDTO } from "../types/email.types";

interface EmailStatsCardsProps {
  stats: EmailStatsDTO | undefined;
  isLoading: boolean;
}

export function EmailStatsCards({ stats, isLoading }: EmailStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summary = stats?.summary;
  const rates = stats?.rates;

  const cards = [
    {
      title: "Total Sent",
      value: summary?.totalSent ?? 0,
      description: `${rates?.deliveryRate?.toFixed(1) ?? 0}% delivery rate`,
      icon: Mail,
      iconColor: "text-blue-500",
    },
    {
      title: "Delivered",
      value: summary?.delivered ?? 0,
      description: `${summary?.opened ?? 0} opened`,
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    {
      title: "Failed",
      value: summary?.failed ?? 0,
      description: `${summary?.bounced ?? 0} bounced`,
      icon: XCircle,
      iconColor: "text-red-500",
    },
    {
      title: "Bounce Rate",
      value: `${rates?.bounceRate?.toFixed(1) ?? 0}%`,
      description: `${summary?.complained ?? 0} complaints`,
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Compact stats row for inline display
 */
interface CompactStatsProps {
  pending: number;
  processing: number;
}

export function CompactStats({ pending, processing }: CompactStatsProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-yellow-500" />
        <span>{pending} pending</span>
      </div>
      <div className="flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <span>{processing} processing</span>
      </div>
    </div>
  );
}
