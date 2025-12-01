'use client';

import { useState } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useLoans } from '@/hooks/use-loans';
import { useMessages, useSendMessage } from '@/hooks/use-messages';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BorrowerMessagesPage() {
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  
  const { data: loans } = useLoans();
  const loan = loans?.[0];
  
  const { data: messages, isLoading } = useMessages(loan?.id || '');
  const sendMessage = useSendMessage();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !loan) return;
    
    try {
      await sendMessage.mutateAsync({
        loan_id: loan.id,
        subject: subject || 'Message from borrower',
        content: newMessage,
      });
      setNewMessage('');
      setSubject('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };
  
  if (isLoading || !loan) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Communicate securely with your loan servicer"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message List */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversation</CardTitle>
                <Badge variant="secondary">
                  Loan #{loan.loan_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {!messages || messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <EmptyState
                    icon={MessageCircle}
                    title="No messages yet"
                    description="Start a conversation with your loan servicer"
                  />
                </div>
              ) : (
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3',
                          message.from === 'borrower' && 'flex-row-reverse'
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback
                            className={cn(
                              message.from === 'borrower'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            {message.from === 'borrower' ? 'ME' : 'SS'}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg p-3',
                            message.from === 'borrower'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm font-medium">{message.subject}</p>
                          <p className="text-sm mt-1">{message.content}</p>
                          <p
                            className={cn(
                              'mt-1 text-xs',
                              message.from === 'borrower'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {formatDateTime(message.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    className="h-auto"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">ServState Support</p>
                  <p className="text-sm text-muted-foreground">
                    Customer Service Team
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Phone: 1-800-555-0199</p>
                <p>Hours: Mon-Fri 8am-8pm EST</p>
                <p>Email: support@servstate.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Payment questions',
                  'Escrow account',
                  'Document requests',
                  'Account changes',
                  'Payoff inquiry',
                ].map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setNewMessage(`I have a question about: ${topic}`)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
