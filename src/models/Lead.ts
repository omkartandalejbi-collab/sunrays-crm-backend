import mongoose, { Document, Model, Schema } from 'mongoose';

export type LeadStatus =
  | 'New'
  | 'Assigned'
  | 'Contacted'
  | 'Interested'
  | 'Follow Up Scheduled'
  | 'Meeting Scheduled'
  | 'Converted'
  | 'Rejected'
  | 'Busy'
  | 'Call Later'
  | 'No Response';

export type Priority = 'High' | 'Medium' | 'Low';
export type AssignmentStatus = 'Assigned' | 'Unassigned';

export interface ILeadInteraction {
  id?: string;
  employee: string;
  employeeId?: mongoose.Types.ObjectId;
  action: string;
  status: string;
  remark: string;
  type?: 'Outgoing' | 'Incoming' | 'Missed' | 'System';
  duration?: string;
  outcome?: string;
  followUpDate?: string;
  followUpTime?: string;
  createdAt: Date;
}

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  company: string;
  phone: string;
  email: string;
  location: string;
  status: LeadStatus;
  priority: Priority;
  assignedTo?: mongoose.Types.ObjectId | null;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  assignedAt?: Date | null;
  assignmentStatus: AssignmentStatus;
  source: string;
  sheetRowId?: string;
  notes?: string;
  lastContactDate?: Date | null;
  nextFollowUpDate?: Date | null;
  nextFollowUpTime?: string;
  interactionHistory: ILeadInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

const interactionSchema = new Schema<ILeadInteraction>(
  {
    employee: { type: String, required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, default: 'Status Updated' },
    status: { type: String, default: 'New' },
    remark: { type: String, default: '' },
    type: { type: String, enum: ['Outgoing', 'Incoming', 'Missed', 'System'], default: 'Outgoing' },
    duration: { type: String, default: '' },
    outcome: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    followUpTime: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'New',
        'Assigned',
        'Contacted',
        'Interested',
        'Follow Up Scheduled',
        'Meeting Scheduled',
        'Converted',
        'Rejected',
        'Busy',
        'Call Later',
        'No Response',
      ],
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedEmployeeName: {
      type: String,
      default: '',
      trim: true,
    },
    assignedEmployeeEmail: {
      type: String,
      default: '',
      trim: true,
    },
    assignedAt: {
      type: Date,
      default: null,
      index: true,
    },
    assignmentStatus: {
      type: String,
      enum: ['Assigned', 'Unassigned'],
      default: 'Unassigned',
      index: true,
    },
    source: {
      type: String,
      default: 'Google Sheet',
      trim: true,
    },
    sheetRowId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    lastContactDate: {
      type: Date,
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    nextFollowUpTime: {
      type: String,
      default: '',
      trim: true,
    },
    interactionHistory: {
      type: [interactionSchema],
      default: [],
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
        if (ret.assignedTo && typeof ret.assignedTo === 'object' && ret.assignedTo._id) {
          ret.assignedTo = ret.assignedTo._id.toString();
        }
        return ret;
      },
    },
  }
);

// Compound text index for fuzzy search across leads
leadSchema.index({ name: 'text', company: 'text', email: 'text', phone: 'text', location: 'text' });

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
