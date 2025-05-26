import { IsOptional, IsString, IsEnum, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { TodoPriority } from '../schemas/todo.schema';
import { Type } from 'class-transformer';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  order?: number;
}