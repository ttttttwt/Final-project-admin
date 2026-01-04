import { useThemeStore } from "@/store/themeStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Monitor, Palette, Shield, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light theme for bright environments",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark theme for low-light environments",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Automatically match your system settings",
  },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
];

/**
 * Settings Page - Application settings and preferences
 * Allows users to configure theme, notifications, and other settings
 */
export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  // Local state for settings (these would be persisted to backend/localStorage in a real app)
  const [language, setLanguage] = useState("en");
  const [autoSave, setAutoSave] = useState(true);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
    });
  };

  const handleSaveGeneral = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the admin panel looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Theme</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`
                        relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 
                        transition-all hover:border-primary/50 hover:bg-muted/50
                        ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                        }
                      `}
                      aria-label={`Select ${option.label} theme`}
                      aria-pressed={isSelected}
                    >
                      <Icon
                        className={`h-8 w-8 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <div className="text-center">
                        <p
                          className={`font-medium ${
                            isSelected ? "text-primary" : ""
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General
            </CardTitle>
            <CardDescription>General application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language for the admin panel
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes while editing content
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                aria-label="Toggle auto save"
              />
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveGeneral}>Save General Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Add an extra layer of security to your account by enabling
                two-factor authentication.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Coming Soon
              </Button>
            </div>

            <Separator />

            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage your active sessions across devices.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Coming Soon
              </Button>
            </div>

            <Separator />

            <div className="rounded-lg border border-destructive/50 p-4 bg-destructive/5">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive" className="mt-4" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
