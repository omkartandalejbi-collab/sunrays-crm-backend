import { subHours, subDays, subMonths } from 'date-fns';

const today = new Date();

const generateSparkline = (base: number, volatility: number) => {
  return Array.from({ length: 14 }).map((_, i) => ({
    day: i,
    value: base + Math.sin(i) * volatility + (i * (volatility * 0.2))
  }));
};

const createLead = (id: string, client: string, company: string, assignedTo: string, avatar: string, status: string, dateOffset: number, offsetType: 'hours' | 'days' | 'months') => {
  let updated = today;
  if (offsetType === 'hours') updated = subHours(today, dateOffset);
  if (offsetType === 'days') updated = subDays(today, dateOffset);
  if (offsetType === 'months') updated = subMonths(today, dateOffset);
  
  return { id, client, company, assignedTo, avatar, status, updated };
};

export const adminAnalytics: Record<string, any> = {
  today: {
    stats: {
      totalLeads: { value: '42', percentage: 12, trend: 'up', subtitle: 'Today', sparkline: generateSparkline(40, 5) },
      totalCalls: { value: '184', percentage: 5, trend: 'up', subtitle: 'Today', sparkline: generateSparkline(180, 20) },
      conversionRate: { value: '28%', percentage: 2, trend: 'up', subtitle: 'Today', sparkline: generateSparkline(25, 3) },
      activePipeline: { value: '31', percentage: 4, trend: 'down', subtitle: 'Today', sparkline: generateSparkline(30, 4) },
    },
    conversionData: [
      { label: '09:00', deals: 2 }, { label: '11:00', deals: 5 }, { label: '13:00', deals: 4 }, { label: '15:00', deals: 8 }, { label: '17:00', deals: 6 }
    ],
    callsData: [
      { label: '09:00', calls: 45 }, { label: '11:00', calls: 82 }, { label: '13:00', calls: 64 }, { label: '15:00', calls: 91 }, { label: '17:00', calls: 53 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-102', 'Vikram Singh', 'Tata Motors', 'Priya Mehta', 'Priya', 'Contacted', 3, 'hours'),
      createLead('RL-103', 'Neha Gupta', 'Wipro Digital', 'Arjun Nair', 'Arjun', 'Meeting Scheduled', 5, 'hours'),
    ]
  },
  yesterday: {
    stats: {
      totalLeads: { value: '38', percentage: 10, trend: 'down', subtitle: 'Yesterday', sparkline: generateSparkline(35, 8) },
      totalCalls: { value: '210', percentage: 14, trend: 'up', subtitle: 'Yesterday', sparkline: generateSparkline(190, 15) },
      conversionRate: { value: '26%', percentage: 7, trend: 'down', subtitle: 'Yesterday', sparkline: generateSparkline(26, 4) },
      activePipeline: { value: '34', percentage: 9, trend: 'up', subtitle: 'Yesterday', sparkline: generateSparkline(32, 5) },
    },
    conversionData: [
      { label: '09:00', deals: 1 }, { label: '11:00', deals: 3 }, { label: '13:00', deals: 6 }, { label: '15:00', deals: 4 }, { label: '17:00', deals: 7 }
    ],
    callsData: [
      { label: '09:00', calls: 55 }, { label: '11:00', calls: 90 }, { label: '13:00', calls: 45 }, { label: '15:00', calls: 78 }, { label: '17:00', calls: 88 }
    ],
    recentLeads: [
      createLead('RL-104', 'Rohan Desai', 'HDFC Bank', 'Sneha Patil', 'Sneha', 'Interested', 1, 'days'),
      createLead('RL-105', 'Kavita Iyer', 'Infosys', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'days'),
    ]
  },
  last7Days: {
    stats: {
      totalLeads: { value: '245', percentage: 18, trend: 'up', subtitle: 'Last 7 Days', sparkline: generateSparkline(200, 30) },
      totalCalls: { value: '1,420', percentage: 8, trend: 'up', subtitle: 'Last 7 Days', sparkline: generateSparkline(1200, 200) },
      conversionRate: { value: '31%', percentage: 12, trend: 'up', subtitle: 'Last 7 Days', sparkline: generateSparkline(28, 5) },
      activePipeline: { value: '124', percentage: 15, trend: 'up', subtitle: 'Last 7 Days', sparkline: generateSparkline(110, 15) },
    },
    conversionData: [
      { label: 'Mon', deals: 12 }, { label: 'Tue', deals: 18 }, { label: 'Wed', deals: 14 }, { label: 'Thu', deals: 24 }, { label: 'Fri', deals: 19 }, { label: 'Sat', deals: 5 }, { label: 'Sun', deals: 2 }
    ],
    callsData: [
      { label: 'Mon', calls: 182 }, { label: 'Tue', calls: 245 }, { label: 'Wed', calls: 210 }, { label: 'Thu', calls: 278 }, { label: 'Fri', calls: 195 }, { label: 'Sat', calls: 45 }, { label: 'Sun', calls: 20 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-106', 'Sanjay Kapoor', 'Mahindra', 'Vikram Joshi', 'Vikram', 'New', 2, 'days'),
      createLead('RL-107', 'Anjali Verma', 'Tech Mahindra', 'Priya Mehta', 'Priya', 'Converted', 2, 'days'),
      createLead('RL-108', 'Karan Malhotra', 'L&T', 'Arjun Nair', 'Arjun', 'Contacted', 3, 'days'),
      createLead('RL-109', 'Pooja Singh', 'TCS', 'Sneha Patil', 'Sneha', 'Meeting Scheduled', 5, 'days'),
    ]
  },
  last30Days: {
    stats: {
      totalLeads: { value: '892', percentage: 24, trend: 'up', subtitle: 'Last 30 Days', sparkline: generateSparkline(700, 100) },
      totalCalls: { value: '5,840', percentage: 12, trend: 'up', subtitle: 'Last 30 Days', sparkline: generateSparkline(5000, 400) },
      conversionRate: { value: '29%', percentage: 5, trend: 'up', subtitle: 'Last 30 Days', sparkline: generateSparkline(27, 4) },
      activePipeline: { value: '315', percentage: 22, trend: 'up', subtitle: 'Last 30 Days', sparkline: generateSparkline(280, 40) },
    },
    conversionData: [
      { label: 'Week 1', deals: 45 }, { label: 'Week 2', deals: 52 }, { label: 'Week 3', deals: 68 }, { label: 'Week 4', deals: 59 }
    ],
    callsData: [
      { label: 'Week 1', calls: 840 }, { label: 'Week 2', calls: 920 }, { label: 'Week 3', calls: 1150 }, { label: 'Week 4', calls: 1080 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-106', 'Sanjay Kapoor', 'Mahindra', 'Vikram Joshi', 'Vikram', 'New', 2, 'days'),
      createLead('RL-110', 'Rahul Bose', 'Flipkart', 'Priya Mehta', 'Priya', 'Converted', 12, 'days'),
      createLead('RL-111', 'Anita Ray', 'Zomato', 'Arjun Nair', 'Arjun', 'Proposal Sent', 18, 'days'),
      createLead('RL-112', 'Vikas Khanna', 'Swiggy', 'Sneha Patil', 'Sneha', 'Negotiation', 25, 'days'),
    ]
  },
  last2Months: {
    stats: {
      totalLeads: { value: '1,645', percentage: 18, trend: 'up', subtitle: 'Last 2 Months', sparkline: generateSparkline(1400, 150) },
      totalCalls: { value: '11,200', percentage: 9, trend: 'up', subtitle: 'Last 2 Months', sparkline: generateSparkline(10000, 800) },
      conversionRate: { value: '28%', percentage: 2, trend: 'down', subtitle: 'Last 2 Months', sparkline: generateSparkline(29, 3) },
      activePipeline: { value: '380', percentage: 8, trend: 'up', subtitle: 'Last 2 Months', sparkline: generateSparkline(350, 45) },
    },
    conversionData: [
      { label: 'W1', deals: 45 }, { label: 'W3', deals: 68 }, { label: 'W5', deals: 55 }, { label: 'W7', deals: 72 }
    ],
    callsData: [
      { label: 'W1', calls: 840 }, { label: 'W3', calls: 1150 }, { label: 'W5', calls: 950 }, { label: 'W7', calls: 1250 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-110', 'Rahul Bose', 'Flipkart', 'Priya Mehta', 'Priya', 'Interested', 12, 'days'),
      createLead('RL-113', 'Sunil Dutt', 'HCL', 'Arjun Nair', 'Arjun', 'Contacted', 1, 'months'),
      createLead('RL-114', 'Meera Rajput', 'Paytm', 'Sneha Patil', 'Sneha', 'Converted', 1, 'months'),
    ]
  },
  last3Months: {
    stats: {
      totalLeads: { value: '2,450', percentage: 21, trend: 'up', subtitle: 'Last 3 Months', sparkline: generateSparkline(2000, 250) },
      totalCalls: { value: '18,400', percentage: 15, trend: 'up', subtitle: 'Last 3 Months', sparkline: generateSparkline(15000, 1000) },
      conversionRate: { value: '30%', percentage: 4, trend: 'up', subtitle: 'Last 3 Months', sparkline: generateSparkline(28, 4) },
      activePipeline: { value: '410', percentage: 11, trend: 'up', subtitle: 'Last 3 Months', sparkline: generateSparkline(380, 50) },
    },
    conversionData: [
      { label: 'Month 1', deals: 180 }, { label: 'Month 2', deals: 210 }, { label: 'Month 3', deals: 245 }
    ],
    callsData: [
      { label: 'Month 1', calls: 5200 }, { label: 'Month 2', calls: 6100 }, { label: 'Month 3', calls: 7100 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-113', 'Sunil Dutt', 'HCL', 'Arjun Nair', 'Arjun', 'Contacted', 1, 'months'),
      createLead('RL-115', 'Kabir Singh', 'Ola', 'Priya Mehta', 'Priya', 'Converted', 2, 'months'),
      createLead('RL-116', 'Tara Sutaria', 'Uber', 'Sneha Patil', 'Sneha', 'Interested', 2, 'months'),
    ]
  },
  last6Months: {
    stats: {
      totalLeads: { value: '5,120', percentage: 32, trend: 'up', subtitle: 'Last 6 Months', sparkline: generateSparkline(4000, 400) },
      totalCalls: { value: '38,500', percentage: 25, trend: 'up', subtitle: 'Last 6 Months', sparkline: generateSparkline(30000, 2000) },
      conversionRate: { value: '32%', percentage: 8, trend: 'up', subtitle: 'Last 6 Months', sparkline: generateSparkline(30, 5) },
      activePipeline: { value: '540', percentage: 28, trend: 'up', subtitle: 'Last 6 Months', sparkline: generateSparkline(450, 60) },
    },
    conversionData: [
      { label: 'Jan', deals: 140 }, { label: 'Feb', deals: 165 }, { label: 'Mar', deals: 190 }, 
      { label: 'Apr', deals: 215 }, { label: 'May', deals: 250 }, { label: 'Jun', deals: 285 }
    ],
    callsData: [
      { label: 'Jan', calls: 4200 }, { label: 'Feb', calls: 4800 }, { label: 'Mar', calls: 5600 }, 
      { label: 'Apr', calls: 6200 }, { label: 'May', calls: 7100 }, { label: 'Jun', calls: 8200 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-113', 'Sunil Dutt', 'HCL', 'Arjun Nair', 'Arjun', 'Contacted', 1, 'months'),
      createLead('RL-115', 'Kabir Singh', 'Ola', 'Priya Mehta', 'Priya', 'Meeting Scheduled', 2, 'months'),
      createLead('RL-117', 'Deepika P.', 'Myntra', 'Sneha Patil', 'Sneha', 'Converted', 4, 'months'),
      createLead('RL-118', 'Ranveer S.', 'Nykaa', 'Rahul Sharma', 'Rahul', 'Negotiation', 5, 'months'),
    ]
  },
  thisYear: {
    stats: {
      totalLeads: { value: '9,450', percentage: 45, trend: 'up', subtitle: 'This Year', sparkline: generateSparkline(7000, 800) },
      totalCalls: { value: '72,100', percentage: 38, trend: 'up', subtitle: 'This Year', sparkline: generateSparkline(55000, 4000) },
      conversionRate: { value: '34%', percentage: 12, trend: 'up', subtitle: 'This Year', sparkline: generateSparkline(31, 6) },
      activePipeline: { value: '620', percentage: 35, trend: 'up', subtitle: 'This Year', sparkline: generateSparkline(500, 70) },
    },
    conversionData: [
      { label: 'Q1', deals: 495 }, { label: 'Q2', deals: 750 }, { label: 'Q3', deals: 820 }, { label: 'Q4', deals: 940 }
    ],
    callsData: [
      { label: 'Q1', calls: 14600 }, { label: 'Q2', calls: 21500 }, { label: 'Q3', calls: 24000 }, { label: 'Q4', calls: 27000 }
    ],
    recentLeads: [
      createLead('RL-101', 'Aisha Patel', 'Reliance Retail', 'Rahul Sharma', 'Rahul', 'Converted', 1, 'hours'),
      createLead('RL-117', 'Deepika P.', 'Myntra', 'Sneha Patil', 'Sneha', 'Proposal Sent', 4, 'months'),
      createLead('RL-119', 'Shahrukh K.', 'Red Chillies', 'Arjun Nair', 'Arjun', 'Converted', 7, 'months'),
      createLead('RL-120', 'Salman K.', 'Being Human', 'Priya Mehta', 'Priya', 'Contacted', 8, 'months'),
    ]
  },
};
