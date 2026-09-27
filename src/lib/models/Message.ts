import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);