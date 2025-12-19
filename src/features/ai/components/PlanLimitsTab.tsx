/**
 * PlanLimitsTab Component
 * Tab for viewing and editing Free/Pro plan quota limits
 */

import { useState, useEffect } from "react";
import { Save, Crown, User } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanLimits, useUpdatePlanLimits } from "../hooks/useAI";
import type { PlanLimits } from "../types";

/**
 * Limit input field component
 */
function LimitInput({
    id,
    label,
    value,
    onChange,
    description,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    description?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="number"
                min="0"
                max="10000"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            />
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function PlanLimitsTab() {
    const { data: planLimits, isLoading, error } = usePlanLimits();
    const updateMutation = useUpdatePlanLimits();

    const [formData, setFormData] = useState<PlanLimits | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form when data loads
    useEffect(() => {
        if (planLimits && !formData) {
            setFormData(planLimits);
        }
    }, [planLimits, formData]);

    // Track changes
    useEffect(() => {
        if (planLimits && formData) {
            const changed = JSON.stringify(planLimits) !== JSON.stringify(formData);
            setHasChanges(changed);
        }
    }, [planLimits, formData]);

    const handleSave = () => {
        if (formData) {
            updateMutation.mutate(formData, {
                onSuccess: () => {
                    setHasChanges(false);
                },
            });
        }
    };

    const updateField = <K extends keyof PlanLimits>(
        field: K,
        value: PlanLimits[K]
    ) => {
        if (formData) {
            setFormData({ ...formData, [field]: value });
        }
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error || !formData) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Failed to load plan limits. Please try again.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Free Plan Limits */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Free Plan Limits
                    </CardTitle>
                    <CardDescription>
                        Monthly quota limits for users on the Free tier
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <LimitInput
                            id="freeRoleplaySessions"
                            label="Role-Play Sessions"
                            value={formData.freeRoleplaySessions}
                            onChange={(v) => updateField("freeRoleplaySessions", v)}
                            description="Sessions per month"
                        />
                        <LimitInput
                            id="freeFlashcardDecks"
                            label="Flashcard Decks"
                            value={formData.freeFlashcardDecks}
                            onChange={(v) => updateField("freeFlashcardDecks", v)}
                            description="Decks per month"
                        />
                        <LimitInput
                            id="freeGrammarExercises"
                            label="Grammar Exercises"
                            value={formData.freeGrammarExercises}
                            onChange={(v) => updateField("freeGrammarExercises", v)}
                            description="Exercises per month"
                        />
                        <LimitInput
                            id="freeTotalRequests"
                            label="Total AI Requests"
                            value={formData.freeTotalRequests}
                            onChange={(v) => updateField("freeTotalRequests", v)}
                            description="All AI requests per month"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pro Plan Limits */}
            <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        Pro Plan Limits
                    </CardTitle>
                    <CardDescription>
                        Monthly quota limits for users on Pro (Monthly/Yearly) plans
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <LimitInput
                            id="proRoleplaySessions"
                            label="Role-Play Sessions"
                            value={formData.proRoleplaySessions}
                            onChange={(v) => updateField("proRoleplaySessions", v)}
                            description="Sessions per month"
                        />
                        <LimitInput
                            id="proFlashcardDecks"
                            label="Flashcard Decks"
                            value={formData.proFlashcardDecks}
                            onChange={(v) => updateField("proFlashcardDecks", v)}
                            description="Decks per month"
                        />
                        <LimitInput
                            id="proGrammarExercises"
                            label="Grammar Exercises"
                            value={formData.proGrammarExercises}
                            onChange={(v) => updateField("proGrammarExercises", v)}
                            description="Exercises per month"
                        />
                        <LimitInput
                            id="proTotalRequests"
                            label="Total AI Requests"
                            value={formData.proTotalRequests}
                            onChange={(v) => updateField("proTotalRequests", v)}
                            description="All AI requests per month"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Warning Thresholds */}
            <Card>
                <CardHeader>
                    <CardTitle>Warning Thresholds</CardTitle>
                    <CardDescription>
                        Percentage thresholds for quota usage warnings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <LimitInput
                            id="warningThresholdPercent"
                            label="Warning Threshold (%)"
                            value={formData.warningThresholdPercent}
                            onChange={(v) => updateField("warningThresholdPercent", Math.min(100, Math.max(0, v)))}
                            description="Show warning when usage reaches this %"
                        />
                        <LimitInput
                            id="criticalThresholdPercent"
                            label="Critical Threshold (%)"
                            value={formData.criticalThresholdPercent}
                            onChange={(v) => updateField("criticalThresholdPercent", Math.min(100, Math.max(0, v)))}
                            description="Show critical warning at this %"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}

export default PlanLimitsTab;
