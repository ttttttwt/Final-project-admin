/**
 * SubscriptionManagementPage Component
 * Admin page for managing subscription plans and promo codes
 */

import { useState } from 'react';
import {
    CreditCard,
    Ticket,
    RefreshCw,
    Plus,
    Edit,
    Power,
    Trash2,
    DollarSign,
    Percent,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    usePlans,
    usePromoCodes,
    useSubscriptionStats,
    useUpdatePlan,
    useTogglePlanActive,
    useCreatePromoCode,
    useDeactivatePromoCode,
} from './hooks';
import type { SubscriptionPlanDTO, PromoCodeDTO, CreatePromoCodeRequest } from './types';

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

// Format date
function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { dateStyle: 'short' });
}

// Stats Card
function StatsCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

// Plan Edit Dialog
function PlanEditDialog({
    plan,
    open,
    onOpenChange,
}: {
    plan: SubscriptionPlanDTO;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [price, setPrice] = useState(plan.price.toString());
    const updateMutation = useUpdatePlan();

    const handleSave = () => {
        updateMutation.mutate(
            { id: plan.id, updates: { price: parseFloat(price) } },
            { onSuccess: () => onOpenChange(false) }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa: {plan.name}</DialogTitle>
                    <DialogDescription>Cập nhật giá cho gói {plan.planType}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Giá hiện tại</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="pl-9"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Lưu ý: Thay đổi giá sẽ được áp dụng cho đăng ký mới. Người dùng hiện tại sẽ được thông báo khi gia hạn.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Create Promo Dialog
function CreatePromoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [formData, setFormData] = useState<CreatePromoCodeRequest>({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
    const createMutation = useCreatePromoCode();

    const handleSubmit = () => {
        createMutation.mutate(formData, { onSuccess: () => { onOpenChange(false); resetForm(); } });
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            validFrom: new Date().toISOString().slice(0, 16),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tạo Promo Code mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Mã code *</Label>
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="VD: NEWYEAR2024"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Loại giảm giá</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(v) => setFormData({ ...formData, discountType: v as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Giá trị</Label>
                            <Input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bắt đầu</Label>
                            <Input
                                type="datetime-local"
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kết thúc</Label>
                            <Input
                                type="datetime-local"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Số lần sử dụng tối đa</Label>
                        <Input
                            type="number"
                            value={formData.maxUses || ''}
                            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="Không giới hạn"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending || !formData.code}>
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo Promo Code'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function SubscriptionManagementPage() {
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDTO | null>(null);
    const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
    const [promoSearch, setPromoSearch] = useState('');
    const [promoPage, setPromoPage] = useState(0);

    const { data: plans, isLoading: plansLoading, refetch: refetchPlans } = usePlans();
    const { data: promoCodes, isLoading: promoLoading, refetch: refetchPromos } = usePromoCodes(promoPage, 10, promoSearch);
    const { data: stats } = useSubscriptionStats();
    const toggleActiveMutation = useTogglePlanActive();
    const deactivatePromoMutation = useDeactivatePromoCode();

    const handleTogglePlan = (plan: SubscriptionPlanDTO) => {
        toggleActiveMutation.mutate({ id: plan.id, isActive: !plan.isActive });
    };

    const handleDeactivatePromo = (promo: PromoCodeDTO) => {
        if (confirm(`Bạn có chắc muốn vô hiệu hóa mã "${promo.code}"?`)) {
            deactivatePromoMutation.mutate(promo.id);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="h-8 w-8" />
                        Subscription Management
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý gói đăng ký và mã giảm giá
                    </p>
                </div>
                <Button variant="outline" onClick={() => { refetchPlans(); refetchPromos(); }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <StatsCard title="Tổng gói" value={stats.totalPlans} icon={CreditCard} />
                    <StatsCard title="Gói đang hoạt động" value={stats.activePlans} icon={Power} />
                    <StatsCard title="Tổng Promo Code" value={stats.totalPromoCodes} icon={Ticket} />
                    <StatsCard title="Promo đang có hiệu lực" value={stats.validPromoCodes} icon={Percent} />
                </div>
            )}

            <Tabs defaultValue="plans" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="plans">Gói đăng ký</TabsTrigger>
                    <TabsTrigger value="promos">Promo Code</TabsTrigger>
                </TabsList>

                {/* Plans Tab */}
                <TabsContent value="plans">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gói đăng ký</CardTitle>
                            <CardDescription>Quản lý giá và trạng thái các gói</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {plansLoading ? (
                                <Skeleton className="h-[200px] w-full" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tên gói</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Giá</TableHead>
                                            <TableHead>Chu kỳ</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plans?.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell className="font-medium">
                                                    {plan.name}
                                                    {plan.isFeatured && <Badge className="ml-2" variant="secondary">Featured</Badge>}
                                                </TableCell>
                                                <TableCell>{plan.planType}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold">{formatCurrency(plan.price)}</span>
                                                    {plan.originalPrice && (
                                                        <span className="text-sm text-muted-foreground line-through ml-2">
                                                            {formatCurrency(plan.originalPrice)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{plan.billingInterval}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={plan.isActive}
                                                        onCheckedChange={() => handleTogglePlan(plan)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingPlan(plan)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Promo Codes Tab */}
                <TabsContent value="promos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Promo Code</CardTitle>
                                <CardDescription>Quản lý mã giảm giá</CardDescription>
                            </div>
                            <Button onClick={() => setIsCreatePromoOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo mới
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Tìm kiếm mã..."
                                value={promoSearch}
                                onChange={(e) => { setPromoSearch(e.target.value); setPromoPage(0); }}
                                className="max-w-sm"
                            />
                            {promoLoading ? (
                                <Skeleton className="h-[200px] w-full" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Giảm giá</TableHead>
                                            <TableHead>Hiệu lực</TableHead>
                                            <TableHead>Sử dụng</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {promoCodes?.content.map((promo) => (
                                            <TableRow key={promo.id}>
                                                <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                                                <TableCell>
                                                    {promo.discountType === 'PERCENTAGE'
                                                        ? `${promo.discountValue}%`
                                                        : formatCurrency(promo.discountValue)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {promo.usedCount} / {promo.maxUses || '∞'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={promo.isCurrentlyValid ? 'default' : 'secondary'}>
                                                        {promo.isCurrentlyValid ? 'Có hiệu lực' : 'Hết hạn'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeactivatePromo(promo)}
                                                        disabled={!promo.isActive}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!promoCodes?.content || promoCodes.content.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                    Không có promo code nào
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                            {/* Pagination */}
                            {promoCodes && promoCodes.totalPages > 1 && (
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={promoPage === 0}
                                        onClick={() => setPromoPage(p => p - 1)}
                                    >
                                        Trước
                                    </Button>
                                    <span className="py-2 px-3 text-sm">
                                        Trang {promoPage + 1} / {promoCodes.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={promoPage >= promoCodes.totalPages - 1}
                                        onClick={() => setPromoPage(p => p + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            {editingPlan && (
                <PlanEditDialog
                    plan={editingPlan}
                    open={!!editingPlan}
                    onOpenChange={(open) => !open && setEditingPlan(null)}
                />
            )}
            <CreatePromoDialog open={isCreatePromoOpen} onOpenChange={setIsCreatePromoOpen} />
        </div>
    );
}

export default SubscriptionManagementPage;
