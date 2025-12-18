import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RotateCcw, MoreHorizontal, AlertTriangle, ArrowLeft } from "lucide-react";
import type { User } from "../types/user.types";
import { useDeletedUsers, useHardDeleteUser, useRestoreUser } from "../hooks/useUsers";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DeletedUsersPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0,
    });

    // Data fetching
    const { data, isLoading } = useDeletedUsers(pagination.pageIndex, pagination.pageSize);

    // Mutations
    const restoreUserMutation = useRestoreUser();
    const hardDeleteMutation = useHardDeleteUser();

    // Dialog states
    const [userToRestore, setUserToRestore] = useState<User | null>(null);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const [userToHardDelete, setUserToHardDelete] = useState<User | null>(null);
    const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false);
    const [hardDeleteReason, setHardDeleteReason] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");

    // Handle pagination change
    const handlePaginationChange = (pageIndex: number, pageSize: number) => {
        setPagination({
            ...pagination,
            pageIndex,
            pageSize,
        });
    };

    // Update pagination when data changes
    if (data && (data.totalPages !== pagination.totalPages || data.totalElements !== pagination.totalElements)) {
        setPagination((prev) => ({
            ...prev,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
        }));
    }

    // ==================== Restore Handlers ====================

    const handleRestoreClick = (user: User) => {
        setUserToRestore(user);
        setIsRestoreDialogOpen(true);
    };

    const handleRestoreConfirm = async () => {
        if (!userToRestore) return;

        try {
            await restoreUserMutation.mutateAsync(userToRestore.id);
            toast({
                title: "User restored",
                description: `User "${userToRestore.email}" has been restored successfully.`,
            });
            setIsRestoreDialogOpen(false);
            setUserToRestore(null);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message || "Failed to restore user";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        }
    };

    // ==================== Hard Delete Handlers ====================

    const handleHardDeleteClick = (user: User) => {
        setUserToHardDelete(user);
        setHardDeleteReason("");
        setConfirmEmail("");
        setIsHardDeleteDialogOpen(true);
    };

    const handleHardDeleteConfirm = async () => {
        if (!userToHardDelete || !hardDeleteReason.trim()) return;

        try {
            await hardDeleteMutation.mutateAsync({
                id: userToHardDelete.id,
                reason: hardDeleteReason,
            });
            toast({
                title: "User permanently deleted",
                description: `User "${userToHardDelete.email}" has been permanently removed from the system.`,
                variant: "destructive",
            });
            setIsHardDeleteDialogOpen(false);
            setUserToHardDelete(null);
            setHardDeleteReason("");
            setConfirmEmail("");
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message || "Failed to permanently delete user";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        }
    };

    const isHardDeleteDisabled =
        !hardDeleteReason.trim() ||
        confirmEmail !== userToHardDelete?.email ||
        hardDeleteMutation.isPending;

    // ==================== Table Columns ====================

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
            accessorKey: "deletedAt",
            header: "Deleted At",
            cell: (user) => user.deletedAt
                ? format(new Date(user.deletedAt), "MMM d, yyyy HH:mm")
                : "—",
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
                        <DropdownMenuItem onClick={() => handleRestoreClick(user)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleHardDeleteClick(user)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="container space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/users")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trash2 className="h-6 w-6" />
                        Deleted Users (Trash)
                    </h1>
                    <p className="text-muted-foreground">
                        Restore or permanently delete users that have been moved to trash.
                    </p>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={data?.content || []}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                isLoading={isLoading}
            />

            {/* Empty State */}
            {!isLoading && data?.content?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Trash2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Trash is empty</p>
                    <p className="text-sm">No deleted users to display.</p>
                </div>
            )}

            {/* Restore Confirmation Dialog */}
            <ConfirmDialog
                open={isRestoreDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsRestoreDialogOpen(false);
                        setUserToRestore(null);
                    }
                }}
                title="Restore User"
                description={
                    userToRestore
                        ? `Are you sure you want to restore "${userToRestore.email}"? The user will be reactivated and moved back to the active users list.`
                        : "Are you sure you want to restore this user?"
                }
                confirmLabel="Restore"
                cancelLabel="Cancel"
                onConfirm={handleRestoreConfirm}
                isLoading={restoreUserMutation.isPending}
            />

            {/* Hard Delete Confirmation Dialog (Two-Step) */}
            <Dialog
                open={isHardDeleteDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsHardDeleteDialogOpen(false);
                        setUserToHardDelete(null);
                        setHardDeleteReason("");
                        setConfirmEmail("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Permanently Delete User
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            This action <strong>cannot be undone</strong>. The user and all their data will be permanently removed from the database.
                        </DialogDescription>
                    </DialogHeader>

                    {userToHardDelete && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                                <p className="text-sm font-medium">{userToHardDelete.email}</p>
                                <p className="text-sm text-muted-foreground">
                                    {userToHardDelete.firstName} {userToHardDelete.lastName}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason for permanent deletion <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Enter the reason for permanent deletion..."
                                    value={hardDeleteReason}
                                    onChange={(e) => setHardDeleteReason(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmEmail">
                                    Type <span className="font-mono text-destructive">{userToHardDelete.email}</span> to confirm
                                </Label>
                                <Input
                                    id="confirmEmail"
                                    placeholder="Enter email to confirm"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsHardDeleteDialogOpen(false);
                                setUserToHardDelete(null);
                                setHardDeleteReason("");
                                setConfirmEmail("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleHardDeleteConfirm}
                            disabled={isHardDeleteDisabled}
                        >
                            {hardDeleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
