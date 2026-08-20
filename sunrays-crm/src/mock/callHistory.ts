import { CallHistory } from '../types';
import { subDays, subHours } from 'date-fns';
import { mockClients } from './clients';

const generateCallHistory = (): CallHistory[] => {
  const history: CallHistory[] = [];
  const today = new Date();
  
  const types: CallHistory['type'][] = ['Outgoing', 'Incoming', 'Missed'];
  const statuses = ['Interested', 'Follow Up Scheduled', 'Meeting Scheduled', 'Call Later', 'Busy', 'No Response'];
  
  for (let i = 0; i < 50; i++) {
    const client = mockClients[i % mockClients.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = subDays(today, daysAgo);
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let duration = '00m 00s';
    let outcome = 'No response';
    let remark = 'Client did not answer the phone. Left a voicemail.';
    
    if (type !== 'Missed') {
      const mins = Math.floor(Math.random() * 15) + 1;
      const secs = Math.floor(Math.random() * 60);
      duration = `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
      outcome = 'Requested Pricing Deck';
      remark = 'Client requested pricing information.\nAsked for callback tomorrow after 2 PM.\nDecision maker unavailable.';
    }

    history.push({
      id: `call-${i + 1}`,
      clientId: client.id,
      employee: 'Jane Doe',
      type,
      duration,
      status: type === 'Missed' ? 'No Response' : status,
      outcome: type === 'Missed' ? 'Missed Call' : outcome,
      remark,
      followUpDate: type === 'Missed' ? undefined : subHours(date, -24).toISOString(),
      createdAt: date.toISOString(),
    });
  }
  
  return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockCallHistory = generateCallHistory();
