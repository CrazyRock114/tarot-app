import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingDocument extends Document {
  userId: string;
  spreadType: string;
  spreadName: string;
  cards: Array<{
    cardId: number;
    cardName: string;
    cardNameEn: string;
    position: number;
    orientation: 'upright' | 'reversed';
    positionName?: string;
  }>;
  question: string;
  interpretation: string;
  createdAt: Date;
}

const ReadingSchema = new Schema<IReadingDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  spreadType: {
    type: String,
    required: true,
  },
  spreadName: {
    type: String,
    required: true,
  },
  cards: [{
    cardId: Number,
    cardName: String,
    cardNameEn: String,
    position: Number,
    orientation: {
      type: String,
      enum: ['upright', 'reversed'],
    },
    positionName: String,
  }],
  question: {
    type: String,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Reading = mongoose.model<IReadingDocument>('Reading', ReadingSchema);
