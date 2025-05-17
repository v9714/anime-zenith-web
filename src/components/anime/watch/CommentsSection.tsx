
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp } from "lucide-react";

interface Comment {
  user: string;
  avatar: string;
  ago: string;
  content: string;
  likes: number;
  isPremium?: boolean;
}

interface CommentsSectionProps {
  comments: Comment[];
}

export function CommentsSection({ comments }: CommentsSectionProps) {
  const [showLogin, setShowLogin] = useState(false);
  
  return (
    <Card className="w-full mt-6 bg-card/90 shadow-xl border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-primary h-5 w-5" />
          <h3 className="font-bold text-lg flex-1">Comments</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowLogin(true)} className="bg-secondary/90 hover:bg-secondary text-white">
            Login to Comment
          </Button>
        </div>
        
        {showLogin && (
          <div className="mb-4 text-sm bg-accent/30 border border-accent/20 px-4 py-3 rounded-md">
            <p className="text-accent-foreground">Login to join the conversation! Share your thoughts with other anime fans.</p>
          </div>
        )}
        
        <div className="space-y-4 max-h-[320px] overflow-auto pr-1">
          {comments.map((c, idx) => (
            <div key={idx} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{c.user}</h4>
                <div className="text-sm mb-2">{c.content}</div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-3 w-3" /> {c.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <MessageSquare className="h-3 w-3" /> Reply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="mt-3 w-full text-muted-foreground hover:text-foreground">
          View more comments
        </Button>
      </CardContent>
    </Card>
  );
}
