'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Star,
  Users,
  Calendar,
  CheckCircle,
  Camera,
  FileText,
  UserCheck,
  MapPin,
  Laptop,
  Navigation,
  Mail,
  Phone,
  MessageSquare,
  User,
  CalendarDays,
  Repeat,
  Infinity,
  Tag,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { useChallengeStore, useSubmissionStore } from '@/store';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/mock-data';
import { formatDate, cn } from '@/lib/utils';

const STATUS_BADGES: Record<string, { variant: 'default' | 'success' | 'warning' | 'info' | 'outline'; label: string }> = {
  draft: { variant: 'outline', label: 'Entwurf' },
  active: { variant: 'success', label: 'Aktiv' },
  paused: { variant: 'warning', label: 'Pausiert' },
  completed: { variant: 'info', label: 'Abgeschlossen' },
};

const VERIFICATION_ICONS: Record<string, typeof Camera> = {
  photo: Camera,
  text: FileText,
  ngo_confirmation: UserCheck,
};

const VERIFICATION_LABELS: Record<string, string> = {
  photo: 'Foto hochladen',
  text: 'Text einreichen',
  ngo_confirmation: 'NGO Bestätigung',
};

const SCHEDULE_TYPE_LABELS: Record<string, { label: string; icon: typeof Calendar }> = {
  anytime: { label: 'Jederzeit', icon: Infinity },
  fixed: { label: 'Fester Termin', icon: CalendarDays },
  range: { label: 'Zeitraum', icon: Calendar },
  recurring: { label: 'Wiederkehrend', icon: Repeat },
};

const CONTACT_METHOD_LABELS: Record<string, { label: string; icon: typeof Mail }> = {
  email: { label: 'E-Mail', icon: Mail },
  phone: { label: 'Telefon', icon: Phone },
  app: { label: 'In-App', icon: MessageSquare },
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { challenges, deleteChallenge, publishChallenge, pauseChallenge } = useChallengeStore();
  const { submissions } = useSubmissionStore();

  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) {
    return (
      <div className="flex flex-col">
        <Header
          title="Challenge nicht gefunden"
          description="Die angeforderte Challenge existiert nicht"
          action={
            <Link href="/challenges">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
          }
        />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-lg font-medium">Challenge nicht gefunden</p>
              <p className="text-sm">Die Challenge mit ID "{id}" existiert nicht.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusBadge = STATUS_BADGES[challenge.status];
  const progress = (challenge.currentParticipants / challenge.maxParticipants) * 100;
  const VerificationIcon = VERIFICATION_ICONS[challenge.verificationMethod] || Camera;

  // Get submissions for this challenge
  const challengeSubmissions = submissions.filter((s) => s.challengeId === challenge.id);
  const pendingSubmissions = challengeSubmissions.filter((s) => s.status === 'submitted');
  const approvedSubmissions = challengeSubmissions.filter((s) => s.status === 'approved');

  const handleDelete = () => {
    if (confirm('Möchtest du diese Challenge wirklich löschen?')) {
      deleteChallenge(challenge.id);
      router.push('/challenges');
    }
  };

  const scheduleInfo = SCHEDULE_TYPE_LABELS[challenge.schedule?.type || 'anytime'];
  const ScheduleIcon = scheduleInfo.icon;

  return (
    <div className="flex flex-col">
      <Header
        title={challenge.title}
        description={`${CATEGORY_LABELS[challenge.category]} · ${challenge.duration} Minuten`}
        action={
          <div className="flex items-center gap-2">
            <Link href="/challenges">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <Link href={`/challenges/${challenge.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </Link>
            {challenge.status === 'draft' && (
              <Button onClick={() => publishChallenge(challenge.id)}>
                <Play className="h-4 w-4 mr-2" />
                Veröffentlichen
              </Button>
            )}
            {challenge.status === 'active' && (
              <Button variant="outline" onClick={() => pauseChallenge(challenge.id)}>
                <Pause className="h-4 w-4 mr-2" />
                Pausieren
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden">
              <img
                src={challenge.imageUrl}
                alt={challenge.title}
                className="w-full aspect-video object-cover"
              />
              {/* Badges */}
              <div className="p-4 flex flex-wrap gap-2">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant="outline">{CATEGORY_LABELS[challenge.category]}</Badge>
                <Badge variant="outline">
                  {challenge.type === 'digital' ? 'Digital' : 'Vor Ort'}
                </Badge>
                {challenge.isMultiPerson && (
                  <Badge variant="success">
                    Team ({challenge.minTeamSize}-{challenge.maxTeamSize})
                  </Badge>
                )}
                {challenge.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-50">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{challenge.description}</p>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Anleitung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{challenge.instructions}</p>
              </CardContent>
            </Card>

            {/* Location (for onsite challenges) */}
            {challenge.type === 'onsite' && challenge.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-500" />
                    Ort & Treffpunkt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{challenge.location.name}</p>
                      {challenge.location.address && (
                        <p className="text-sm text-slate-500">{challenge.location.address}</p>
                      )}
                    </div>
                  </div>

                  {challenge.location.meetingPoint && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Navigation className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Treffpunkt</p>
                        <p className="text-sm text-slate-500">{challenge.location.meetingPoint}</p>
                      </div>
                    </div>
                  )}

                  {challenge.location.additionalInfo && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">{challenge.location.additionalInfo}</p>
                    </div>
                  )}

                  {challenge.location.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${challenge.location.coordinates.lat},${challenge.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Auf Google Maps öffnen
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Person */}
            {challenge.contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-500" />
                    Kontaktperson
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{challenge.contact.name}</p>
                      {challenge.contact.role && (
                        <p className="text-sm text-slate-500">{challenge.contact.role}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {challenge.contact.email && (
                        <a
                          href={`mailto:${challenge.contact.email}`}
                          className="p-2 bg-white border rounded-lg hover:bg-slate-50"
                          title={challenge.contact.email}
                        >
                          <Mail className="h-4 w-4 text-slate-600" />
                        </a>
                      )}
                      {challenge.contact.phone && (
                        <a
                          href={`tel:${challenge.contact.phone}`}
                          className="p-2 bg-white border rounded-lg hover:bg-slate-50"
                          title={challenge.contact.phone}
                        >
                          <Phone className="h-4 w-4 text-slate-600" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {challenge.contact.preferredMethod && (
                      <span className="flex items-center gap-1 text-slate-500">
                        {(() => {
                          const method = CONTACT_METHOD_LABELS[challenge.contact.preferredMethod];
                          const Icon = method?.icon || Mail;
                          return (
                            <>
                              <Icon className="h-4 w-4" />
                              Bevorzugt: {method?.label || 'E-Mail'}
                            </>
                          );
                        })()}
                      </span>
                    )}
                    {challenge.contact.responseTime && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-4 w-4" />
                        {challenge.contact.responseTime}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Challenge Info */}
            {challenge.isMultiPerson && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-500" />
                    Team-Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Teamgröße</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {challenge.minTeamSize} - {challenge.maxTeamSize} Personen
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Matchmaking</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {challenge.allowSoloJoin ? 'Aktiviert' : 'Nicht verfügbar'}
                      </p>
                    </div>
                  </div>

                  {challenge.teamDescription && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{challenge.teamDescription}</p>
                    </div>
                  )}

                  {challenge.allowSoloJoin && challenge.teammateSeekers && challenge.teammateSeekers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        Suchen Teammitglieder ({challenge.teammateSeekers.length})
                      </p>
                      <div className="space-y-2">
                        {challenge.teammateSeekers.slice(0, 3).map((seeker) => (
                          <div
                            key={seeker.id}
                            className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                          >
                            <img
                              src={seeker.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seeker.name}`}
                              alt={seeker.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{seeker.name}</p>
                              <p className="text-xs text-slate-500">
                                {LEVEL_LABELS[seeker.level] || seeker.level}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Submissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Einreichungen</CardTitle>
                {challengeSubmissions.length > 0 && (
                  <Link href="/submissions">
                    <Button variant="ghost" size="sm">
                      Alle anzeigen
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {challengeSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Noch keine Einreichungen</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {challengeSubmissions.slice(0, 5).map((submission) => (
                      <Link
                        key={submission.id}
                        href={`/submissions/${submission.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={submission.studentAvatar}
                          alt={submission.studentName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {submission.studentName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            submission.status === 'approved'
                              ? 'success'
                              : submission.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {submission.status === 'approved'
                            ? 'Genehmigt'
                            : submission.status === 'rejected'
                            ? 'Abgelehnt'
                            : 'Ausstehend'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Kategorie</span>
                  <Badge variant="outline">{CATEGORY_LABELS[challenge.category]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Art</span>
                  <div className="flex items-center gap-1 text-slate-900">
                    {challenge.type === 'digital' ? (
                      <>
                        <Laptop className="h-4 w-4" />
                        <span>Digital</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>Vor Ort</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Teilnehmer
                    </span>
                    <span className="font-medium">
                      {challenge.currentParticipants}/{challenge.maxParticipants}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dauer
                  </span>
                  <span className="font-medium">{challenge.duration} Min</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    XP Belohnung
                  </span>
                  <span className="font-medium">{challenge.xpReward} XP</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <VerificationIcon className="h-4 w-4" />
                    Nachweis
                  </span>
                  <span className="font-medium">
                    {VERIFICATION_LABELS[challenge.verificationMethod]}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScheduleIcon className="h-5 w-5 text-primary-500" />
                  Zeitplan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Typ</span>
                  <Badge variant="outline">{scheduleInfo.label}</Badge>
                </div>

                {challenge.schedule?.type === 'fixed' && challenge.schedule.startDate && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Datum</span>
                      <span className="text-sm font-medium">
                        {formatDate(challenge.schedule.startDate)}
                      </span>
                    </div>
                    {challenge.schedule.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Ende</span>
                        <span className="text-sm">
                          {new Date(challenge.schedule.endDate).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {challenge.schedule?.type === 'range' && (
                  <>
                    {challenge.schedule.startDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Start</span>
                        <span className="text-sm">{formatDate(challenge.schedule.startDate)}</span>
                      </div>
                    )}
                    {challenge.schedule.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Ende</span>
                        <span className="text-sm">{formatDate(challenge.schedule.endDate)}</span>
                      </div>
                    )}
                    {challenge.schedule.isFlexible !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Flexibel</span>
                        <span className="text-sm">{challenge.schedule.isFlexible ? 'Ja' : 'Nein'}</span>
                      </div>
                    )}
                  </>
                )}

                {challenge.schedule?.type === 'recurring' && challenge.schedule.timeSlots && (
                  <div>
                    <span className="text-slate-600 text-sm">Zeitfenster:</span>
                    <div className="mt-1 space-y-1">
                      {challenge.schedule.timeSlots.map((slot, i) => (
                        <p key={i} className="text-sm font-medium bg-slate-50 px-2 py-1 rounded">
                          {slot}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {challenge.schedule?.deadline && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-slate-600">Deadline</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatDate(challenge.schedule.deadline)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Erstellt
                  </span>
                  <span className="text-sm">{formatDate(challenge.createdAt)}</span>
                </div>
                {challenge.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Veröffentlicht
                    </span>
                    <span className="text-sm">{formatDate(challenge.publishedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submissions Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Einreichungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-700">Ausstehend</span>
                  <span className="font-bold text-amber-700">{pendingSubmissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Genehmigt</span>
                  <span className="font-bold text-green-700">{approvedSubmissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Gesamt</span>
                  <span className="font-bold text-slate-700">{challengeSubmissions.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Challenge löschen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
