import { AuthForm } from "@/components/forms/auth-form";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[40%] w-[80%] h-[80%] rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[40%] w-[80%] h-[80%] rounded-full bg-teal-300/20 blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}