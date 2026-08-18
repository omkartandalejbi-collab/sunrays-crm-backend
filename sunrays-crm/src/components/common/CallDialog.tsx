import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Client } from '../../types';
import { Phone, MicOff, PhoneOff, PhoneCall, Check, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export interface CallDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

type CallState = 'idle' | 'calling' | 'connected' | 'ended';

export const CallDialog: React.FC<CallDialogProps> = ({ client, isOpen, onClose }) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showDialPad, setShowDialPad] = useState(false);
  const [notes, setNotes] = useState('');
  const [dialedNumber, setDialedNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCallState('idle');
      setDuration(0);
      setIsMuted(false);
      setIsOnHold(false);
      setIsSpeaker(false);
      setShowDialPad(false);
      setNotes('');
      setDialedNumber('');
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (callState === 'connected' && !isOnHold) {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState, isOnHold]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setCallState('calling');
    setTimeout(() => {
      setCallState('connected');
      toast.success('Call connected');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setShowDialPad(false);
    toast('Call ended', { description: `Duration: ${formatDuration(duration)}` });
  };

  const handleSaveNotes = () => {
    toast.success('Call notes and disposition saved');
    onClose();
  };

  const handleDial = (num: string) => {
    setDialedNumber(prev => prev + num);
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border-border shadow-2xl rounded-[16px]">
        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          {/* Left Panel: Phone UI */}
          <div className="w-full md:w-5/12 bg-sidebar text-white p-8 flex flex-col items-center border-r border-border">
            
            <DialogHeader className="text-center w-full mt-2">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sidebar-accent border border-sidebar-border shadow-sm relative overflow-hidden">
                {callState === 'connected' ? (
                  <>
                    <div className="absolute inset-0 bg-success/20 animate-pulse" />
                    <PhoneCall className="h-10 w-10 text-success relative z-10" />
                  </>
                ) : callState === 'calling' ? (
                  <Phone className="h-10 w-10 text-white animate-bounce relative z-10" />
                ) : (
                  <Phone className="h-10 w-10 text-sidebar-foreground relative z-10" />
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">{client.name}</DialogTitle>
              <DialogDescription className="text-sm flex items-center justify-center gap-2 mt-1 text-sidebar-foreground">
                {client.phone}
              </DialogDescription>
            </DialogHeader>

            <div className="my-8 text-center flex-1 w-full flex flex-col justify-center">
              <span className="text-[12px] font-medium text-sidebar-foreground uppercase tracking-widest block mb-2">
                {callState === 'idle' && 'Ready to call'}
                {callState === 'calling' && 'Dialing...'}
                {callState === 'connected' && (isOnHold ? 'On Hold' : 'Call in progress')}
                {callState === 'ended' && 'Call Ended'}
              </span>
              
              <AnimatePresence mode="wait">
                {(callState === 'connected' || callState === 'ended') && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[40px] font-medium tracking-tight text-white font-mono leading-none"
                  >
                    {formatDuration(duration)}
                  </motion.div>
                )}
              </AnimatePresence>

              {showDialPad && callState === 'connected' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-[220px] mx-auto"
                >
                  <div className="h-12 mb-4 bg-sidebar-accent rounded-lg flex items-center justify-center text-xl tracking-[0.2em] border border-sidebar-border">
                    {dialedNumber}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['1','2','3','4','5','6','7','8','9','*','0','#'].map((num) => (
                      <button 
                        key={num}
                        onClick={() => handleDial(num)}
                        className="h-12 rounded-[12px] bg-sidebar-accent hover:bg-white hover:text-sidebar text-lg font-medium transition-colors border border-sidebar-border shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="w-full pb-2">
              {callState === 'idle' && (
                <Button onClick={handleStartCall} className="w-full bg-success hover:bg-success/90 text-white h-12 rounded-[12px] text-[15px] font-semibold">
                  <Phone className="mr-2 h-4 w-4" /> Start Call
                </Button>
              )}

              {callState === 'calling' && (
                <Button onClick={() => setCallState('idle')} variant="destructive" className="w-full h-12 rounded-[12px] text-[15px] font-semibold bg-danger hover:bg-danger/90">
                  <PhoneOff className="mr-2 h-4 w-4" /> Cancel
                </Button>
              )}

              {callState === 'connected' && !showDialPad && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button onClick={() => setIsMuted(!isMuted)} className={`flex flex-col items-center gap-2 ${isMuted ? 'text-white' : 'text-sidebar-foreground hover:text-white'} transition-colors`}>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border border-sidebar-border ${isMuted ? 'bg-primary' : 'bg-sidebar-accent'}`}>
                      <MicOff className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] uppercase font-semibold">Mute</span>
                  </button>
                  <button onClick={() => setShowDialPad(true)} className="flex flex-col items-center gap-2 text-sidebar-foreground hover:text-white transition-colors">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-sidebar-accent border border-sidebar-border">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                    </div>
                    <span className="text-[11px] uppercase font-semibold">Keypad</span>
                  </button>
                  <button onClick={() => setIsSpeaker(!isSpeaker)} className={`flex flex-col items-center gap-2 ${isSpeaker ? 'text-white' : 'text-sidebar-foreground hover:text-white'} transition-colors`}>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border border-sidebar-border ${isSpeaker ? 'bg-primary' : 'bg-sidebar-accent'}`}>
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] uppercase font-semibold">Speaker</span>
                  </button>
                </div>
              )}

              {callState === 'connected' && (
                <Button onClick={handleEndCall} variant="destructive" className="w-full h-12 rounded-[12px] text-[15px] font-semibold bg-danger hover:bg-danger/90">
                  <PhoneOff className="mr-2 h-4 w-4" /> End Call
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel: CRM Data */}
          <div className="w-full md:w-7/12 p-8 flex flex-col bg-background">
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-small-label text-muted-foreground mb-4">Call Disposition</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-foreground">Outcome</label>
                    <Select defaultValue="connected" disabled={callState !== 'ended'}>
                      <SelectTrigger className="bg-card border-border h-10">
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="connected">Connected / Spoke</SelectItem>
                        <SelectItem value="voicemail">Left Voicemail</SelectItem>
                        <SelectItem value="no_answer">No Answer</SelectItem>
                        <SelectItem value="busy">Busy / Rejected</SelectItem>
                        <SelectItem value="wrong_number">Wrong Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-foreground">Next Action</label>
                    <Select defaultValue="follow_up" disabled={callState !== 'ended'}>
                      <SelectTrigger className="bg-card border-border h-10">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow_up">Schedule Follow Up</SelectItem>
                        <SelectItem value="meeting">Schedule Meeting</SelectItem>
                        <SelectItem value="send_email">Send Email/Proposal</SelectItem>
                        <SelectItem value="not_interested">Mark Not Interested</SelectItem>
                        <SelectItem value="convert">Convert to Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-small-label text-muted-foreground">
                  Call Notes
                </label>
                <Textarea
                  placeholder="Take detailed notes during or after the call..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none flex-1 min-h-[150px] bg-card border-border rounded-lg text-[14px]"
                  disabled={callState === 'idle' || callState === 'calling'}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 pt-6 border-t border-border gap-3 sm:justify-end">
              <Button variant="ghost" onClick={onClose} disabled={callState === 'connected'} className="text-foreground hover:bg-muted font-medium">
                Cancel
              </Button>
              <Button onClick={handleSaveNotes} disabled={callState !== 'ended'} className="bg-primary hover:bg-primary-hover text-white font-medium shadow-sm">
                <Check className="mr-2 h-4 w-4" /> Save & Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
