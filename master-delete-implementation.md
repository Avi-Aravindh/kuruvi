# Master Delete Button Implementation

## Issue
The task management UI was missing a "master delete" button to delete all tasks across all agents at once. The existing functionality only supported:
1. Deleting individual tasks
2. Deleting all tasks for a specific agent

## Solution
Added a master delete button that allows users to delete ALL tasks across ALL agents with a single action.

## Changes Made

### 1. Backend (convex/tasks.ts)
Added new mutation `deleteAllTasks`:
```typescript
export const deleteAllTasks = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    await Promise.all(tasks.map((task) => ctx.db.delete(task._id)));
  },
});
```

### 2. Frontend (app/page.tsx)
- Added `deleteAllTasks` mutation hook
- Added "Clear All" button in the header next to "New" button
- Button only appears when there are tasks (conditional rendering)
- Includes confirmation dialog: "Delete all X tasks? This cannot be undone."
- Red hover effect to indicate destructive action

## UI/UX Design
- **Placement**: Header, next to the "New" button
- **Label**: "Clear All" (shows icon on mobile, text on desktop)
- **Appearance**: Gray outline button by default, turns red on hover
- **Safety**: Requires confirmation dialog before deletion
- **Visibility**: Only shows when tasks exist

## Verification
- ✅ Build passes: `npm run build` completes successfully
- ✅ TypeScript compilation: No type errors
- ⚠️  Lint: Pre-existing lint errors unrelated to this change
- ✅ Code follows existing patterns and style

## Testing Checklist
To verify the feature:
1. Open the Kuruvi web app
2. Create multiple tasks across different agents
3. Observe the "Clear All" button appears in the header
4. Click the button
5. Confirm the deletion in the dialog
6. All tasks should be removed from all agents

## Code Quality
- Follows the existing codebase patterns
- Uses async/await for mutation calls
- Includes proper confirmation dialog
- Implements smooth hover transitions
- Responsive design (icon-only on mobile, text on desktop)
