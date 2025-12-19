import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AINav, PlanLimitsTab } from "../components";
import {
  useAISettings,
  useUpdateAISettings,
  useToggleFeature,
} from "../hooks/useAI";
import type { AIFeatureConfig, AIGlobalSettings } from "../types";

export function AIConfigPage() {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useAISettings();

  const updateSettingsMutation = useUpdateAISettings();
  const toggleFeatureMutation = useToggleFeature();

  const [formData, setFormData] = useState<Omit<AIGlobalSettings, "features"> | null>(null);

  // Initialize form data when settings load
  useEffect(() => {
    if (settings && !formData) {
      const { features, ...globalSettings } = settings;
      setFormData(globalSettings);
    }
  }, [settings, formData]);

  const handleSaveGlobal = () => {
    if (!formData) return;
    updateSettingsMutation.mutate(formData);
  };

  const handleToggleFeature = (featureName: string, isEnabled: boolean) => {
    toggleFeatureMutation.mutate({ featureName, isEnabled });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <AINav />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading configuration</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load settings"}
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
          <h1 className="text-3xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-muted-foreground">
            Manage global AI settings, plan limits, and feature flags
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="plan-limits">Plan Limits</TabsTrigger>
          <TabsTrigger value="features">Feature Management</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>
                Configure global AI parameters and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading || !formData ? (
                <div className="py-8 text-center">Loading settings...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Global AI Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Master switch to enable/disable all AI features
                      </p>
                    </div>
                    <Switch
                      checked={formData.globalEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, globalEnabled: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyBudgetLimit">Monthly Budget Limit ($)</Label>
                      <Input
                        id="monthlyBudgetLimit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.monthlyBudgetLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyBudgetLimit: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertThresholdPercentage">Alert Threshold (%)</Label>
                      <Input
                        id="alertThresholdPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.alertThresholdPercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            alertThresholdPercentage: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerInputToken">Cost Per Input Token ($)</Label>
                      <Input
                        id="costPerInputToken"
                        type="number"
                        step="0.000001"
                        value={formData.costPerInputToken}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            costPerInputToken: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerOutputToken">Cost Per Output Token ($)</Label>
                      <Input
                        id="costPerOutputToken"
                        type="number"
                        step="0.000001"
                        value={formData.costPerOutputToken}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            costPerOutputToken: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable global rate limiting for AI requests
                      </p>
                    </div>
                    <Switch
                      checked={formData.rateLimitEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, rateLimitEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Fallback Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable fallback to alternative models on failure
                      </p>
                    </div>
                    <Switch
                      checked={formData.fallbackEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, fallbackEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveGlobal}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan-limits" className="space-y-4">
          <PlanLimitsTab />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable specific AI features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading features...</div>
              ) : (
                <div className="space-y-6">
                  {settings?.features.map((feature: AIFeatureConfig) => (
                    <div
                      key={feature.featureName}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{feature.featureName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.isEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleFeature(feature.featureName, checked)
                        }
                        disabled={toggleFeatureMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIConfigPage;
