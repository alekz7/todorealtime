import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create(createTodoDto, req.user._id);
  }

  @Get()
  findAll(@Request() req) {
    return this.todosService.findAll(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.todosService.findOne(id, req.user._id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req) {
    return this.todosService.update(id, updateTodoDto, req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.todosService.remove(id, req.user._id);
  }

  @Post('reorder')
  reorder(@Body() data: { todoIds: string[] }, @Request() req) {
    return this.todosService.reorder(req.user._id, data.todoIds);
  }
}