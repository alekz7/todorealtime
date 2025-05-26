"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { CheckCircle, Circle, MoreVertical, Clock, CalendarIcon, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Todo, TodoApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card3D } from "@/components/ui/card-3d";

interface TodoCardProps {
  todo: Todo;
  index: number;
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoCard({ todo, index, onUpdate, onDelete }: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: todo.title,
      description: todo.description || "",
    },
  });

  const handleToggleComplete = async () => {
    try {
      await onUpdate(todo._id, { completed: !todo.completed });
    } catch (error) {
      console.error("Failed to toggle todo completion:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    reset({
      title: todo.title,
      description: todo.description || "",
    });
    setIsEditing(false);
  };

  const handleSaveEdit = handleSubmit(async (data) => {
    try {
      await onUpdate(todo._id, data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  });

  const handleConfirmDelete = async () => {
    try {
      await onDelete(todo._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCardBgGradient = (priority: string) => {
    switch (priority) {
      case "high":
        return "linear-gradient(135deg, rgb(254, 202, 202), rgb(252, 165, 165))";
      case "medium":
        return "linear-gradient(135deg, rgb(253, 230, 138), rgb(252, 211, 77))";
      case "low":
        return "linear-gradient(135deg, rgb(191, 219, 254), rgb(147, 197, 253))";
      default:
        return "linear-gradient(135deg, rgb(243, 244, 246), rgb(229, 231, 235))";
    }
  };

  return (
    <Draggable draggableId={todo._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Card3D
            backgroundGradient={getCardBgGradient(todo.priority)}
            className={cn(
              "w-full overflow-hidden transition-all duration-200",
              todo.completed && "opacity-80"
            )}
            shadow={snapshot.isDragging ? "0 20px 60px -15px rgba(0, 0, 0, 0.5)" : undefined}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={handleToggleComplete}
                    className="mt-1 focus:outline-none"
                    aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    {isEditing ? (
                      <form onSubmit={handleSaveEdit} className="space-y-2">
                        <Textarea
                          {...register("title", { required: true })}
                          className="font-medium resize-none bg-white/50 backdrop-blur-sm"
                          rows={1}
                        />
                        <Textarea
                          {...register("description")}
                          className="text-sm resize-none bg-white/50 backdrop-blur-sm"
                          placeholder="Add a description..."
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" type="submit">
                            Save
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div
                        className={cn(
                          "w-full",
                          todo.completed && "line-through text-gray-500"
                        )}
                      >
                        <h3 className="font-medium text-gray-900 mb-1">
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    )}

                    {!isEditing && todo.dueDate && (
                      <div className="flex items-center mt-2 text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          Due {format(new Date(todo.dueDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center ml-2">
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full mr-2", 
                        getPriorityColor(todo.priority)
                      )} 
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </Card3D>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this todo? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Draggable>
  );
}