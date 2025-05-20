"use client";

import { TodoList } from '@/components/Todo/TodoList';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto">
        <TodoList />
      </div>
    </main>
  );
} 