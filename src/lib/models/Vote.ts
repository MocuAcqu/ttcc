import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  name: string;
  phone: string;
  reason: string;
  popularVote: number;
  innovationVote: number;
  impactVote: number;
  createdAt: Date;
}

const VoteSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, 
  reason: { type: String }, 
  popularVote: { type: Number, required: true },
  innovationVote: { type: Number, required: true },
  impactVote: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);