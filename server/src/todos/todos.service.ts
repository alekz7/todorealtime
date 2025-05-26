import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    const maxOrderTodo = await this.todoModel
      .findOne({ user: userId })
      .sort({ order: -1 })
      .exec();
    
    const newOrder = maxOrderTodo ? maxOrderTodo.order + 1 : 0;
    
    const newTodo = new this.todoModel({
      ...createTodoDto,
      order: createTodoDto.order ?? newOrder,
      user: userId,
    });
    
    const savedTodo = await newTodo.save();
    this.eventsGateway.todoUpdated(userId, 'created');
    return savedTodo;
  }

  async findAll(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ user: userId }).sort({ order: 1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoModel.findOne({ _id: id, user: userId }).exec();
    
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    const updatedTodo = await this.todoModel
      .findOneAndUpdate({ _id: id, user: userId }, updateTodoDto, { new: true })
      .exec();
    
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    this.eventsGateway.todoUpdated(userId, 'updated');
    return updatedTodo;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.todoModel.deleteOne({ _id: id, user: userId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    this.eventsGateway.todoUpdated(userId, 'deleted');
  }

  async reorder(userId: string, todoIds: string[]): Promise<void> {
    const bulkOps = todoIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: userId },
        update: { $set: { order: index } },
      },
    }));

    await this.todoModel.bulkWrite(bulkOps);
    this.eventsGateway.todoUpdated(userId, 'reordered');
  }
}