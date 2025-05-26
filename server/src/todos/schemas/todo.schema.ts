import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Todo extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ 
    type: String, 
    enum: TodoPriority,
    default: TodoPriority.MEDIUM
  })
  priority: TodoPriority;

  @Prop()
  dueDate: Date;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);