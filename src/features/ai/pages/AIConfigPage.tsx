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
import { AINav } from "../components";
import {
  useAISettings,
  useUpdateAISettings,
  useToggleFeature,
} from "../hooks/useAI";
import type { AIFeatureConfig } from "../types";

export function AIConfigPage() {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useAISettings();

  const updateSettingsMutation = useUpdateAISettings();
  const toggleFeatureMutation = useToggleFeature();

  const [formData, setFormData] = useState<{
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
  } | null>(null);

  // Initialize form data when settings load
  useEffect(() => {
    if (settings && !formData) {
      setFormData({
        provider: settings.provider,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      });
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
            Manage global AI settings and feature flags
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
          <TabsTrigger value="features">Feature Management</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Configure the default AI model parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading || !formData ? (
                <div className="py-8 text-center">Loading settings...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={formData.provider}
                        onChange={(e) =>
                          setFormData({ ...formData, provider: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={formData.temperature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            temperature: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={formData.maxTokens}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxTokens: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
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
