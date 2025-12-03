import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { errorResponse, successResponse, createAuditLogEntry } from '@/lib/api-helpers';
import { taskCreateSchema } from '@/lib/schemas';

/**
 * GET /api/tasks?loanId=...
 * List tasks (servicer only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can access tasks
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    let tasks;
    if (loanId) {
      tasks = await sql`
        SELECT * FROM tasks 
        WHERE loan_id = ${loanId}
        ORDER BY due_date ASC, priority DESC
      `;
    } else {
      tasks = await sql`
        SELECT * FROM tasks 
        ORDER BY due_date ASC, priority DESC
      `;
    }

    return successResponse(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return errorResponse('Failed to fetch tasks', 500);
  }
}

/**
 * POST /api/tasks
 * Create a new task (servicer only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { user } = session;

    // Only servicers can create tasks
    if (user.role !== 'servicer' && user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();

    // Validate input
    const validation = taskCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid input: ' + validation.error.message, 400);
    }

    const data = validation.data;

    // Insert task
    const result = await sql`
      INSERT INTO tasks (
        loan_id,
        title,
        description,
        priority,
        status,
        assigned_to,
        due_date,
        type,
        category
      ) VALUES (
        ${data.loan_id},
        ${data.title},
        ${data.description || null},
        ${data.priority},
        ${data.status || 'pending'},
        ${data.assigned_to || null},
        ${data.due_date || null},
        ${data.type},
        ${data.category}
      )
      RETURNING *
    `;

    const task = result[0];

    // Create audit log entry
    await createAuditLogEntry({
      loanId: data.loan_id,
      actionType: 'task_created',
      category: 'internal',
      description: `Task created: ${data.title}`,
      performedBy: user.name,
      details: {
        task_id: task.id,
        priority: data.priority,
        type: data.type,
        category: data.category,
      },
      referenceId: task.id,
    });

    return successResponse(task, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return errorResponse('Failed to create task', 500);
  }
}



