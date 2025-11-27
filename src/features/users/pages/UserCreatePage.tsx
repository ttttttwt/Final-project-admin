import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "../components/UserForm";
import { useCreateUser } from "../hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import type { CreateUserInput, UpdateUserInput } from "../types/user.types";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const handleSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      await createUser.mutateAsync(data as CreateUserInput);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      navigate("/users");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm onSubmit={handleSubmit} isLoading={createUser.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
