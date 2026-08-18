import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Mail, Phone, CalendarDays, Building2, Briefcase, Hash, Target, Trophy, TrendingUp } from 'lucide-react';
import { Employee, User } from '../../types';
import { format, parseISO } from 'date-fns';

export interface ProfileCardProps {
  user: User;
  employee: Employee;
  onEdit: () => void;
  onChangePassword: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, employee, onEdit, onChangePassword }) => {
  return (
    <Card className="overflow-hidden border border-border shadow-sm bg-card relative rounded-[16px]">
      {/* Enterprise Cover Background */}
      <div className="h-32 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-16 left-8 z-10">
          <Avatar className="h-32 w-32 border-[6px] border-card shadow-sm">
            <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <CardContent className="pt-20 pb-8 px-8 relative">
        <div className="flex flex-col xl:flex-row justify-between gap-10">
          
          <div className="space-y-8 flex-1">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[28px] font-bold tracking-tight text-foreground">{user.name}</h2>
                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20 px-2 py-0.5 rounded-[6px]">Online</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-muted-foreground font-medium text-[14px]">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.designation}</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.department}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border border-border">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-[14px] font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border border-border">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-[14px] font-medium text-foreground">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border border-border">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Employee ID</p>
                  <p className="text-[14px] font-medium text-foreground font-mono">{employee.id.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border border-border">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Joining Date</p>
                  <p className="text-[14px] font-medium text-foreground">
                    {employee.joiningDate ? format(parseISO(employee.joiningDate), 'MMMM d, yyyy') : 'Jan 15, 2023'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 xl:w-[320px] shrink-0">
            <div className="flex gap-3">
              <Button onClick={onEdit} className="flex-1 shadow-sm font-semibold h-11 bg-primary hover:bg-primary-hover text-white">Edit Profile</Button>
              <Button variant="outline" onClick={onChangePassword} className="flex-1 shadow-sm font-semibold h-11 border-border text-foreground hover:bg-muted">Password</Button>
            </div>
            
            <div className="enterprise-card bg-card border border-border">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-card-title">Performance</h3>
              </div>
              
              <div className="flex items-end justify-between mb-4">
                <div className="text-[32px] font-bold text-foreground tracking-tight leading-none">
                  {employee.performanceScore}
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/20 border-none px-2 rounded-md font-semibold">Top 10%</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Monthly Quota</span>
                  <span className="text-foreground">142 / 150</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[94%]" />
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-success pt-1">
                  <TrendingUp className="h-3.5 w-3.5" /> +12% vs last month
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
