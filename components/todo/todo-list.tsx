"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Plus, ListFilter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { TodoCard } from "@/components/todo/todo-card";
import { CreateTodoDialog } from "@/components/todo/create-todo-dialog";
import { TodoFilterDialog } from "@/components/todo/todo-filter-dialog";
import { Todo, TodoApi, getSocket } from "@/lib/api";

type FilterState = {
  showCompleted: boolean;
  priority: string | null;
  searchTerm: string;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    showCompleted: true,
    priority: null,
    searchTerm: "",
  });
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    try {
      const data = await TodoApi.getAll();
      setTodos(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      toast({
        title: "Error",
        description: "Failed to load your todos. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchTodos();

    // Set up socket connection
    const socket = getSocket();
    if (socket) {
      socket.on("todos-updated", (data) => {
        fetchTodos();
      });

      return () => {
        socket.off("todos-updated");
      };
    }
  }, [fetchTodos]);

  useEffect(() => {
    // Apply filters
    let result = [...todos];

    // Filter by completion status
    if (!filters.showCompleted) {
      result = result.filter((todo) => !todo.completed);
    }

    // Filter by priority
    if (filters.priority) {
      result = result.filter((todo) => todo.priority === filters.priority);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description &&
            todo.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTodos(result);
  }, [todos, filters]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredTodos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFilteredTodos(items);

    // Create a list of all todo IDs in their new order
    const allTodos = [...todos];
    const sourceItem = allTodos.find(todo => todo._id === reorderedItem._id);
    
    if (sourceItem) {
      const itemsToReorder = allTodos.map(todo => todo._id);
      
      // Move the source item to the destination index in the full list
      const newIndex = result.destination.index;
      const todoIds = [...itemsToReorder];
      
      try {
        await TodoApi.reorder(todoIds);
      } catch (error) {
        console.error("Failed to reorder todos:", error);
        toast({
          title: "Error",
          description: "Failed to reorder todos. Please try again.",
          variant: "destructive",
        });
        // Revert to original order
        fetchTodos();
      }
    }
  };

  const handleCreateTodo = async (newTodo: any) => {
    try {
      await TodoApi.create(newTodo);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Todo created successfully!",
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast({
        title: "Error",
        description: "Failed to create todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTodo = async (id: string, data: Partial<Todo>) => {
    try {
      await TodoApi.update(id, data);
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await TodoApi.delete(id);
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo, index) => (
                  <TodoCard
                    key={todo._id}
                    todo={todo}
                    index={index}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))
              ) : (
                <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50">
                  <p className="text-gray-500">
                    {todos.length > 0
                      ? "No todos match your filters"
                      : "You don't have any tasks yet"}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-2"
                  >
                    Create your first task
                  </Button>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <CreateTodoDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTodo}
      />

      <TodoFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}