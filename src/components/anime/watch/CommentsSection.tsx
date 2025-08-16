
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, User, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const handleCommentSubmit = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (newComment.trim()) {
      // TODO: Add comment submission logic
      setNewComment("");
    }
  };
  
  return (
    <Card className="w-full mt-6 bg-card/90 shadow-xl border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-primary h-5 w-5" />
          <h3 className="font-bold text-lg flex-1">Comments ({comments.length})</h3>
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-muted-foreground">Logged in as {currentUser.displayName}</span>
            </div>
          )}
        </div>

        {/* Comment Input */}
        {currentUser ? (
          <div className="mb-6 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Share your thoughts about this episode..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                className="flex-1"
              />
              <Button 
                size="sm" 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground flex-1">
                Please log in to join the conversation and share your thoughts with other anime fans.
              </p>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setShowLoginPrompt(true)}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Login to Comment
              </Button>
            </div>
          </div>
        )}
        
        {showLoginPrompt && !currentUser && (
          <div className="mb-4 text-sm bg-accent/20 border border-accent/30 px-4 py-3 rounded-md">
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
