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
    <Card className="p-4 flex flex-col items-center justify-center space-y-2 transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border hover:border-primary/20">
      <div className={cn("p-3 rounded-full bg-secondary/80")}>
        {icon}
      </div>
      <p className="text-sm font-medium text-muted-foreground pt-2">{label}</p>
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
    </Card>
  );
}
