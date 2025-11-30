'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Filter, Calendar, User, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { mockTasks, getPendingTasksCount } from '@/data';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const router = useRouter();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTasks = mockTasks.filter((task) => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesPriority && matchesStatus && matchesCategory;
  });

  const pendingCount = mockTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = mockTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = mockTasks.filter((t) => t.status === 'completed').length;
  const highPriorityCount = mockTasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;

  const categories = [...new Set(mockTasks.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage and track servicing tasks"
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending"
          value={pendingCount}
          subtitle="Tasks to start"
          icon={CheckSquare}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Currently working"
          icon={CheckSquare}
          variant="warning"
        />
        <StatCard
          title="High Priority"
          value={highPriorityCount}
          subtitle="Urgent attention"
          icon={CheckSquare}
          variant="destructive"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          subtitle="Tasks done"
          icon={CheckSquare}
          variant="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Task List ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors hover:bg-muted/50',
                  task.status === 'completed' && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === 'completed'}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-medium',
                          task.status === 'completed' && 'line-through'
                        )}>
                          {task.title}
                        </p>
                        <Badge
                          variant={
                            task.priority === 'high'
                              ? 'destructive'
                              : task.priority === 'medium'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/servicer/loans/${task.loan_id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigned_to}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {formatDate(task.due_date)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <span>
                        {task.borrower_name} - Loan #{task.loan_number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No tasks match your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
