"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/dashboard-layout";
import TodoList from "@/components/todo/todo-list";
import { useAuth } from "@/lib/auth";
import { connectSocket, disconnectSocket } from "@/lib/api";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    
    // Connect to WebSocket
    if (user) {
      connectSocket();
    }
    
    // Cleanup WebSocket connection
    return () => {
      disconnectSocket();
    };
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TodoList />
      </motion.div>
    </DashboardLayout>
  );
}