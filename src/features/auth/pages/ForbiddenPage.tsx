import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <h1 className="text-4xl font-bold text-destructive">403</h1>
            <h2 className="text-2xl font-semibold">Access Forbidden</h2>
            <p className="text-muted-foreground">
                You do not have permission to access this resource.
            </p>
            <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
    );
}
