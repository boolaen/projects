'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { apiFetch } from '@/lib/api';

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    user: {
        username: string;
    };
}

interface CommentSectionProps {
    videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    // const { user } = useAuth(); // If auth context exists
    const user = { username: "Demo User" }; // Placeholder until AuthContext is verified

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const fetchComments = async () => {
        try {
            const res = await apiFetch(`/interactions/comments/${videoId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await apiFetch(`/interactions/comment/${videoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                const savedComment = await res.json();
                setComments([savedComment, ...comments]);
                setNewComment("");
            } else {
                const errorData = await res.json();
                alert(`Yorum hatası: ${errorData.message}`);
            }
        } catch (error) {
            // Error handled silently
            alert("Yorum gönderilemedi.");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold">Yorumlar ({comments.length})</h3>

            {/* Add Comment */}
            <div className="flex gap-4">
                <Avatar>
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold">U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Input
                        placeholder="Yorum ekle..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-muted border-border focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={handlePostComment}
                            disabled={!newComment.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yorum Yap
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">{comment.user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">{comment.user.username}</span>
                                <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-zinc-300 dark:text-zinc-300 text-zinc-700">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
