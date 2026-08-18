import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'employee';
export type UserStatus = 'Active' | 'On Leave' | 'Offline' | 'Inactive' | 'active' | 'inactive' | 'suspended' | 'on_leave' | 'offline';

export const ALL_APP_MODULES = [
  'dashboard',
  'assignedClients',
  'followUps',
  'callHistory',
  'profile',
  'reports'
] as const;

export type AppModule = typeof ALL_APP_MODULES[number];

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: string;
  isAccessEnabled: boolean;
  allowedModules: string[];
  department: string;
  designation: string;
  phone: string;
  performanceScore: number;
  assignedLeads: number;
  calls: number;
  meetings: number;
  interested: number;
  converted: number;
  conversionRate: number;
  avatarSeed: string;
  avatarUrl?: string;
  forcePasswordReset: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
      index: true,
    },
    status: {
      type: String,
      default: 'Active',
      index: true,
    },
    isAccessEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    allowedModules: {
      type: [String],
      default: ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'],
    },
    department: {
      type: String,
      default: 'Sales',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Sales Executive',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    performanceScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    assignedLeads: {
      type: Number,
      default: 0,
    },
    calls: {
      type: Number,
      default: 0,
    },
    meetings: {
      type: Number,
      default: 0,
    },
    interested: {
      type: Number,
      default: 0,
    },
    converted: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
    avatarSeed: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    forcePasswordReset: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        
        // Normalize status to standard Title Case for consistency
        const rawStatus = (ret.status || 'Active').toLowerCase();
        if (rawStatus === 'active') ret.status = 'Active';
        else if (rawStatus === 'on_leave' || rawStatus === 'on leave') ret.status = 'On Leave';
        else if (rawStatus === 'offline') ret.status = 'Offline';
        else if (rawStatus === 'inactive' || rawStatus === 'suspended') ret.status = 'Inactive';
        else ret.status = 'Active';

        // Normalize avatar URL if missing
        if (!ret.avatarUrl) {
          const seed = ret.avatarSeed || ret.name?.split(' ')[0] || 'User';
          ret.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
        }

        // Normalize allowedModules if previously stored as modules
        if (!ret.allowedModules || ret.allowedModules.length === 0) {
          if (Array.isArray(ret.modules) && ret.modules.length > 0) {
            ret.allowedModules = ret.modules.map((m: string) => {
              if (m === 'clients') return 'assignedClients';
              if (m === 'follow-ups') return 'followUps';
              if (m === 'call-history') return 'callHistory';
              return m;
            });
          } else {
            ret.allowedModules = ['dashboard', 'assignedClients', 'followUps', 'callHistory', 'profile'];
          }
        }

        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
