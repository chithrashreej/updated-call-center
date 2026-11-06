import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Building2, MapPin, Mail, Info } from 'lucide-react';
import { useCall } from '@/context/CallContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { formatClock } from '@/utils/format';
import { todayISODate } from '@/utils/dates';

type CallState = 'connecting' | 'active';
type MicStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

const MIC_MESSAGES: Record<MicStatus, string> = {
  requesting: 'Requesting microphone access...',
  granted: 'Microphone connected',
  denied: 'Microphone blocked. The simulated call continues without audio.',
  unavailable: 'This browser has no microphone support. The simulated call continues without audio.',
};

const pad = (n: number) => n.toString().padStart(2, '0');

export function CallOverlay() {
  const { target, endCall } = useCall();
  const { logCall } = useData();
  const { push } = useToast();
  const [state, setState] = useState<CallState>('connecting');
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micStatus, setMicStatus] = useState<MicStatus>('requesting');
  const streamRef = useRef<MediaStream | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!target) return;
    endedRef.current = false;
    setState('connecting');
    setSeconds(0);
    setMuted(false);

    let cancelled = false;
    const stopTracks = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unavailable');
      setState('active');
    } else {
      setMicStatus('requesting');
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          setMicStatus('granted');
        })
        .catch(() => {
          if (!cancelled) setMicStatus('denied');
        })
        .finally(() => {
          if (!cancelled) setState('active');
        });
    }

    return () => {
      cancelled = true;
      stopTracks();
    };
  }, [target]);

  useEffect(() => {
    if (state !== 'active') return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  if (!target) return null;

  const toggleMute = () => {
    const nextMuted = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !nextMuted));
    setMuted(nextMuted);
  };

  const handleEnd = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const now = new Date();
    logCall({
      type: target.callType,
      contactName: target.name,
      company: target.company,
      phone: target.phone,
      date: todayISODate(),
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      durationSeconds: seconds,
      status: 'Completed',
      outcome: 'Simulated call. No phone connection was made.',
      leadId: target.leadId,
      simulated: true,
    });
    push(`Simulated call with ${target.name} logged. No real call was placed.`, 'info');
    endCall();
  };

  const initials = target.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <Modal open onClose={handleEnd} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="grid place-items-center w-20 h-20 rounded-full bg-slate-900 text-white text-2xl font-semibold mb-3">
          {initials}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{target.name}</h3>
        {(target.title || target.company) && (
          <p className="text-sm text-slate-500">
            {target.title ? `${target.title} · ` : ''}
            {target.company}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 badge bg-amber-100 text-amber-700">
          <Info size={12} /> Simulated call. Not connected to the phone network.
        </div>

        <div className="mt-4 text-3xl font-mono font-semibold text-slate-800 tabular-nums">
          {state === 'connecting' ? 'Connecting...' : formatClock(seconds)}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {state === 'active' ? (
            <span className="flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Simulated call in progress
            </span>
          ) : (
            'Preparing simulated call'
          )}
        </div>

        <p className={`mt-3 text-xs max-w-xs ${micStatus === 'denied' || micStatus === 'unavailable' ? 'text-rose-600' : 'text-slate-500'}`}>
          {MIC_MESSAGES[micStatus]}
        </p>

        <div className="mt-5 w-full grid grid-cols-2 gap-2 text-left text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={13} className="text-slate-400" /> {target.phone}
          </div>
          {target.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail size={13} className="text-slate-400" /> {target.email}
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Building2 size={13} className="text-slate-400" /> {target.company}
          </div>
          {target.city && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={13} className="text-slate-400" /> {target.city}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={toggleMute}
            disabled={state !== 'active' || micStatus !== 'granted'}
            className={`grid place-items-center w-12 h-12 rounded-full transition-colors ${
              muted ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            } disabled:opacity-40`}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={handleEnd}
            className="grid place-items-center w-14 h-14 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            aria-label="End call"
          >
            <PhoneOff size={22} />
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 max-w-xs">
          Calls are simulated in this app. Connecting a telephony provider is required for real calls. Ending the call saves a record to Recent Calls.
        </p>
      </div>
    </Modal>
  );
}
