import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

export default function ResultCard({ icon, label, value, color }: ResultCardProps) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 hover:shadow-lg bg-card">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-lg font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-4xl font-bold", color)}>{value}</p>
    </Card>
  );
}
