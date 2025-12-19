/**
 * PlanBadge Component
 * Visual badge showing FREE or PRO subscription status
 */

import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlanType } from "../types";
import { isPro } from "../types";

interface PlanBadgeProps {
    planType: PlanType | string | undefined | null;
    size?: "sm" | "default";
}

export function PlanBadge({ planType, size = "default" }: PlanBadgeProps) {
    const isProPlan = isPro(planType as PlanType);

    if (isProPlan) {
        return (
            <Badge
                variant="default"
                className={`bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 ${size === "sm" ? "text-xs px-1.5 py-0" : ""
                    }`}
            >
                <Crown className={`${size === "sm" ? "h-3 w-3 mr-0.5" : "h-3.5 w-3.5 mr-1"}`} />
                PRO
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className={`text-muted-foreground ${size === "sm" ? "text-xs px-1.5 py-0" : ""}`}
        >
            FREE
        </Badge>
    );
}

export default PlanBadge;
