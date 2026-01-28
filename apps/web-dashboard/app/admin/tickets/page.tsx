'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useNotificationStore } from '@/components/ui/toast-notifications';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Building2,
  Mail,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  organization_id: string;
  type: 'appeal' | 'support' | 'feedback' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  organization?: {
    name: string;
    contact_email: string;
    logo: string | null;
  };
}

const TICKET_TYPE_LABELS: Record<string, string> = {
  appeal: 'Einspruch',
  support: 'Support',
  feedback: 'Feedback',
  other: 'Sonstiges',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Offen', color: 'bg-blue-500/20 text-blue-300', icon: Clock },
  in_progress: { label: 'In Bearbeitung', color: 'bg-amber-500/20 text-amber-300', icon: RefreshCw },
  resolved: { label: 'Beantwortet', color: 'bg-green-500/20 text-green-300', icon: CheckCircle },
  closed: { label: 'Geschlossen', color: 'bg-slate-500/20 text-slate-300', icon: XCircle },
};

function TicketSkeleton() {
  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48 bg-slate-700" />
            <Skeleton className="h-5 w-20 bg-slate-700" />
          </div>
          <Skeleton className="h-4 w-32 bg-slate-700" />
          <Skeleton className="h-4 w-full bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminTicketsPage() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<'resolved' | 'in_progress' | 'closed'>('resolved');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('open');

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        organization:organizations(name, contact_email, logo)
      `)
      .order('created_at', { ascending: false });

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

  async function handleRespond() {
    if (!selectedTicket || !response.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.rpc('respond_to_ticket', {
      p_ticket_id: selectedTicket.id,
      p_response: response.trim(),
      p_new_status: newStatus,
    });

    if (error) {
      console.error('Failed to respond to ticket:', error);
      addNotification({
        title: 'Fehler',
        description: 'Antwort konnte nicht gesendet werden',
        type: 'error',
      });
    } else {
      addNotification({
        title: 'Antwort gesendet',
        description: 'Das Ticket wurde beantwortet',
        type: 'success',
      });
      setSelectedTicket(null);
      setResponse('');
      loadTickets();
    }

    setSubmitting(false);
  }

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="flex flex-col">
      <AdminHeader
        title="Support Tickets"
        description={`${openCount} offene Anfragen`}
        action={
          <Button
            variant="outline"
            onClick={loadTickets}
            disabled={loading}
            className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }
            >
              {f === 'all' && 'Alle'}
              {f === 'open' && `Offen (${tickets.filter((t) => t.status === 'open').length})`}
              {f === 'in_progress' && 'In Bearbeitung'}
              {f === 'resolved' && 'Beantwortet'}
            </Button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-3">
            <TicketSkeleton />
            <TicketSkeleton />
            <TicketSkeleton />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
              <MessageSquare className="h-12 w-12 mb-4 text-slate-600" />
              <p className="text-lg font-medium text-white">Keine Tickets</p>
              <p className="text-sm">
                {filter === 'open'
                  ? 'Keine offenen Tickets vorhanden'
                  : 'Keine Tickets in dieser Kategorie'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const statusConfig = STATUS_CONFIG[ticket.status];
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={ticket.id}
                  className="border-slate-700 bg-slate-800 cursor-pointer hover:border-slate-600 transition-colors"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setResponse(ticket.admin_response || '');
                    setNewStatus('resolved');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Organization Logo */}
                      {ticket.organization?.logo ? (
                        <img
                          src={ticket.organization.logo}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">
                            {ticket.subject}
                          </h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                          <span className="font-medium text-slate-300">
                            {ticket.organization?.name || 'Unbekannt'}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs border-slate-600 ${
                              ticket.type === 'appeal'
                                ? 'text-amber-400 border-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {TICKET_TYPE_LABELS[ticket.type]}
                          </Badge>
                          <span>{formatDate(new Date(ticket.created_at))}</span>
                        </div>

                        <p className="text-sm text-slate-300 line-clamp-2">{ticket.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Respond Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent
          onClose={() => setSelectedTicket(null)}
          className="bg-slate-800 border border-slate-700 max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-white">{selectedTicket?.subject}</DialogTitle>
            <DialogDescription className="text-slate-400">
              von {selectedTicket?.organization?.name} am{' '}
              {selectedTicket && formatDate(new Date(selectedTicket.created_at))}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              {/* Organization Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                {selectedTicket?.organization?.logo ? (
                  <img
                    src={selectedTicket.organization.logo}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">
                    {selectedTicket?.organization?.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Mail className="h-3 w-3" />
                    {selectedTicket?.organization?.contact_email}
                  </div>
                </div>
              </div>

              {/* Ticket Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nachricht
                </label>
                <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded-lg whitespace-pre-wrap">
                  {selectedTicket?.message}
                </p>
              </div>

              {/* Response */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ihre Antwort
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Antwort verfassen..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Neuer Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="resolved">Beantwortet</option>
                  <option value="in_progress">In Bearbeitung</option>
                  <option value="closed">Geschlossen</option>
                </select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTicket(null)}
              className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!response.trim() || submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Antwort senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
