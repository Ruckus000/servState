import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, query } from '@/lib/db';
import type { TaskRow } from '@/types/db';
import { errorResponse, successResponse, createAuditLogEntry, requireCsrf } from '@/lib/api-helpers';
import { taskUpdateSchema } from '@/lib/schemas';

/**
 * PUT /api/tasks/[id]
 * Update task (servicer only)
 * Security: Requires CSRF token
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

    // CSRF protection
    const csrfError = requireCsrf(request, user.id);
    if (csrfError) {
      return csrfError;
    }

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

    // Fetch old task data to track changes
    const oldTaskResult = await sql<TaskRow>`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (oldTaskResult.length === 0) {
      return errorResponse('Task not found', 404);
    }
    const oldTask = oldTaskResult[0];

    // Build update query
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setParts.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.priority !== undefined) {
      setParts.push(`priority = $${paramIndex++}`);
      values.push(updates.priority);
    }
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
    if (updates.type !== undefined) {
      setParts.push(`type = $${paramIndex++}`);
      values.push(updates.type);
    }
    if (updates.category !== undefined) {
      setParts.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }

    if (setParts.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    setParts.push(`updated_at = NOW()`);
    values.push(taskId);

    const queryText = `UPDATE tasks SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query<TaskRow>(queryText, values);

    const task = result[0];

    // Create audit log entry for status changes
    if (updates.status !== undefined && oldTask.status !== updates.status) {
      await createAuditLogEntry({
        loanId: task.loan_id,
        actionType: 'task_status_changed',
        category: 'internal',
        description: `Task status changed: ${oldTask.status} → ${updates.status}`,
        performedBy: user.name,
        details: {
          task_id: taskId,
          old_status: oldTask.status,
          new_status: updates.status,
          changed_by: user.name,
        },
        referenceId: taskId,
      });
    }

    // Create audit log entry for assignment changes
    if (updates.assigned_to !== undefined && oldTask.assigned_to !== updates.assigned_to) {
      await createAuditLogEntry({
        loanId: task.loan_id,
        actionType: 'task_assigned',
        category: 'internal',
        description: `Task assigned to: ${updates.assigned_to || 'Unassigned'}`,
        performedBy: user.name,
        details: {
          task_id: taskId,
          old_assigned_to: oldTask.assigned_to,
          new_assigned_to: updates.assigned_to,
        },
        referenceId: taskId,
      });
    }

    // Create general audit log entry for other updates
    const otherUpdates = Object.keys(updates).filter(
      key => key !== 'status' && key !== 'assigned_to'
    );
    if (otherUpdates.length > 0) {
      await createAuditLogEntry({
        loanId: task.loan_id,
        actionType: 'task_updated',
        category: 'internal',
        description: `Task updated: ${task.title}`,
        performedBy: user.name,
        details: {
          task_id: taskId,
          changes: updates,
        },
        referenceId: taskId,
      });
    }

    return successResponse(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return errorResponse('Failed to update task', 500);
  }
}













