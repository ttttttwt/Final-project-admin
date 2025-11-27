import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "../components/UserForm";
import { useUser, useUpdateUser } from "../hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import type { CreateUserInput, UpdateUserInput } from "../types/user.types";

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user, isLoading: isLoadingUser } = useUser(id!);
  const updateUser = useUpdateUser();

  const handleSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    if (!id) return;
    try {
      await updateUser.mutateAsync({ id, data: data as UpdateUserInput });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      navigate("/users");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    }
  };

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            initialData={user}
            onSubmit={handleSubmit}
            isLoading={updateUser.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
