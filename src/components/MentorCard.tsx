import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface MentorCardProps {
  message: string;
  author: string;
}

export const MentorCard = ({ message, author }: MentorCardProps) => {
  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm italic mb-2">"{message}"</p>
          <p className="text-xs font-semibold text-muted-foreground">— {author}</p>
        </div>
      </div>
    </Card>
  );
};
