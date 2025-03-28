"use client"; // Required for using hooks in Next.js 13+

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Define Task interface
interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    getTasks();
  }, []);

  async function getTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setTasks(data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (!newTaskTitle) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          title: newTaskTitle,
          description: newTaskDescription, 
          status: 'pending' 
        }])
        .select();

      if (error) throw error;
      
      // Refresh tasks after adding a new one
      getTasks();
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error: any) {
      console.error('Error creating task:', error.message);
    }
  }

  async function updateTaskStatus(id: number, status: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      getTasks();
    } catch (error: any) {
      console.error('Error updating task:', error.message);
    }
  }

  // Function to get status-based styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'completed':
        return "text-green-600 bg-green-50";
      case 'in-progress':
        return "text-amber-600 bg-amber-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Task Manager</h1>

      {/* Task creation form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>Add a new task to your list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createTask}>Add Task</Button>
        </CardFooter>
      </Card>

      {/* Task list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tasks yet. Add your first task above.
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <Select 
                      defaultValue={task.status}
                      onValueChange={(value) => updateTaskStatus(task.id, value)}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusStyles(task.status)}`}>
                        <SelectValue placeholder={task.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
