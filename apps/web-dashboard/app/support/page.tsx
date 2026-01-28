'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { useNotificationStore } from '@/components/ui/toast-notifications';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  type: 'appeal' | 'support' | 'feedback' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

const TICKET_TYPE_LABELS: Record<string, string> = {
  appeal: 'Einspruch',
  support: 'Support-Anfrage',
  feedback: 'Feedback',
  other: 'Sonstiges',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Offen', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Bearbeitung', color: 'bg-amber-100 text-amber-800', icon: RefreshCw },
  resolved: { label: 'Beantwortet', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Geschlossen', color: 'bg-slate-100 text-slate-800', icon: XCircle },
};

function TicketSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SupportPage() {
  const { organization } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [ticketType, setTicketType] = useState<SupportTicket['type']>('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isRejected = organization?.verificationStatus === 'rejected';

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_my_tickets');

    if (error) {
      console.error('Failed to load tickets:', error);
      addNotification({
        title: 'Fehler',
        description: 'Tickets konnten nicht geladen werden',
        type: 'error',
      });
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.rpc('create_support_ticket', {
      p_type: ticketType,
      p_subject: subject.trim(),
      p_message: message.trim(),
    });

    if (error) {
      console.error('Failed to create ticket:', error);
      addNotification({
        title: 'Fehler',
        description: 'Ticket konnte nicht erstellt werden',
        type: 'error',
      });
    } else {
      addNotification({
        title: 'Ticket erstellt',
        description: 'Ihr Ticket wurde erfolgreich eingereicht',
        type: 'success',
      });
      setDialogOpen(false);
      setSubject('');
      setMessage('');
      setTicketType('support');
      loadTickets();
    }

    setSubmitting(false);
  }

  function openNewTicketDialog() {
    // Pre-select 'appeal' for rejected organizations
    if (isRejected) {
      setTicketType('appeal');
    } else {
      setTicketType('support');
    }
    setSubject('');
    setMessage('');
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Support"
        description="Kontaktieren Sie uns oder sehen Sie Ihre Anfragen ein"
        action={
          <Button onClick={openNewTicketDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Ticket
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Appeal CTA for rejected organizations */}
        {isRejected && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">Verifizierung abgelehnt</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {organization?.rejectionReason ||
                      'Ihre Organisation wurde leider abgelehnt. Sie koennen einen Einspruch einreichen.'}
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTicketType('appeal');
                      setSubject('Einspruch gegen Ablehnung');
                      setMessage('');
                      setDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Einspruch einreichen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ihre Tickets</h2>

          {loading ? (
            <div className="space-y-3">
              <TicketSkeleton />
              <TicketSkeleton />
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                <MessageSquare className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-900">Keine Tickets</p>
                <p className="text-sm">Sie haben noch keine Support-Anfragen gestellt</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:border-slate-300 transition-colors"
                    onClick={() => setViewTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900 truncate">
                              {ticket.subject}
                            </h3>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {TICKET_TYPE_LABELS[ticket.type]}
                            </Badge>
                            <span>erstellt am {formatDate(new Date(ticket.created_at))}</span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{ticket.message}</p>
                          {ticket.admin_response && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-800">
                              <span className="font-medium">Antwort:</span> {ticket.admin_response}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Neues Ticket erstellen</DialogTitle>
            <DialogDescription>
              Beschreiben Sie Ihr Anliegen und wir melden uns schnellstmoeglich zurueck.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ticket-Typ *
                </label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value as SupportTicket['type'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="support">Support-Anfrage</option>
                  <option value="appeal">Einspruch (Verifizierung)</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Betreff *
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Kurze Zusammenfassung Ihres Anliegens"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nachricht *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beschreiben Sie Ihr Anliegen im Detail..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={5}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!subject.trim() || !message.trim() || submitting}
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Absenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={!!viewTicket} onOpenChange={() => setViewTicket(null)}>
        <DialogContent onClose={() => setViewTicket(null)}>
          <DialogHeader>
            <DialogTitle>{viewTicket?.subject}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className="mr-2">
                {viewTicket && TICKET_TYPE_LABELS[viewTicket.type]}
              </Badge>
              Erstellt am {viewTicket && formatDate(new Date(viewTicket.created_at))}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                {viewTicket && (
                  <Badge className={STATUS_CONFIG[viewTicket.status].color}>
                    {STATUS_CONFIG[viewTicket.status].label}
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ihre Nachricht
                </label>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {viewTicket?.message}
                </p>
              </div>

              {viewTicket?.admin_response && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Antwort vom Support
                  </label>
                  <p className="text-sm text-slate-600 bg-green-50 border border-green-100 p-3 rounded-lg">
                    {viewTicket.admin_response}
                  </p>
                  {viewTicket.responded_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      Beantwortet am {formatDate(new Date(viewTicket.responded_at))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTicket(null)}>
              Schliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
