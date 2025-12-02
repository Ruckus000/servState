import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import { errorResponse, successResponse, createAuditLogEntry } from '@/lib/api-helpers';
import { taskUpdateSchema } from '@/lib/schemas';
import type { Task } from '@/types/task';

/**
 * PUT /api/tasks/[id]
 * Update task (servicer only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can update tasks
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { id: taskId } = await params;
    const body = await request.json();

    // Validate input
    const validation = taskUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const updates = validation.data;

    // Build update query
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setParts.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.assigned_to !== undefined) {
      setParts.push(`assigned_to = $${paramIndex++}`);
      values.push(updates.assigned_to);
    }
    if (updates.due_date !== undefined) {
      setParts.push(`due_date = $${paramIndex++}`);
      values.push(updates.due_date);
    }

    if (setParts.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    setParts.push(`updated_at = NOW()`);
    values.push(taskId);

    const queryText = `UPDATE tasks SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query<Task>(queryText, values);

    if (result.length === 0) {
      return errorResponse('Task not found', 404);
    }

    const task = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: task.loan_id,
      actionType: 'task_updated',
      category: 'workflow',
      description: `Task updated: ${task.title}`,
      performedBy: user.name,
      details: {
        task_id: taskId,
        changes: updates,
      },
    });

    return successResponse(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return errorResponse('Failed to update task', 500);
  }
}


