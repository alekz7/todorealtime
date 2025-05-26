import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    EventsModule,
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}