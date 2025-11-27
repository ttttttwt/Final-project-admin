import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import type { User } from "../types/user.types";
import { DataTable, type ColumnDef, type PaginationState } from "@/components/shared/DataTable";
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
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  pagination: PaginationState;
  onPaginationChange: (page: number, size: number) => void;
  isLoading: boolean;
}

export function UserTable({ users, pagination, onPaginationChange, isLoading }: UserTableProps) {
  const navigate = useNavigate();

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
            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
    />
  );
}
