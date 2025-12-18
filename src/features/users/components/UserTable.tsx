import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MoreHorizontal, BookOpen, GraduationCap, Eye } from "lucide-react";
import type { User } from "../types/user.types";
import { useDeleteUser } from "../hooks/useUsers";
import {
  DataTable,
  type ColumnDef,
  type PaginationState,
} from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  pagination: PaginationState;
  onPaginationChange: (page: number, size: number) => void;
  isLoading: boolean;
}

export function UserTable({
  users,
  pagination,
  onPaginationChange,
  isLoading,
}: UserTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Delete user state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Delete user mutation (soft delete)
  const deleteUserMutation = useDeleteUser();

  // Handle delete click - open confirmation dialog
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation (soft delete)
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast({
        title: "User moved to trash",
        description: `User "${userToDelete.email}" has been moved to trash. You can restore it later.`,
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to delete user";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      accessorKey: "roles",
      header: "Role",
      cell: (user) => (
        <div className="flex gap-1">
          {user.roles.map((role) => (
            <Badge key={role} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "cefrLevel",
      header: "Level",
      cell: (user) => (
        user.cefrLevel ? (
          <Badge variant="secondary" className="font-mono">
            {user.cefrLevel}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )
      ),
    },
    {
      accessorKey: "enrollments",
      header: "Enrollments",
      cell: (user) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1" title="Courses">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            {user.enrolledCoursesCount ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Paths">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            {user.enrolledPathsCount ?? 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (user) => format(new Date(user.createdAt), "MMM d, yyyy"),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/users/${user.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteClick(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Move to Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog (Soft Delete) */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDialogClose}
        title="Move User to Trash"
        description={
          userToDelete
            ? `Are you sure you want to move "${userToDelete.email}" to trash? The user will be deactivated but their data will be preserved. You can restore them later from the Trash page.`
            : "Are you sure you want to move this user to trash?"
        }
        confirmLabel="Move to Trash"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={deleteUserMutation.isPending}
      />
    </>
  );
}

