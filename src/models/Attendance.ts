import mongoose, { Document, Model, Schema } from 'mongoose';
import { AttendanceStatus } from '../services/attendanceRuleService.js';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: string; // 'YYYY-MM-DD'
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  workingHours: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      index: true,
      trim: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Leave', 'Absent', 'Week Off'],
      default: 'Present',
      index: true,
    },
    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
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
        return ret;
      },
    },
  }
);

// Compound Unique Index: One employee can have at most one attendance record per calendar date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
