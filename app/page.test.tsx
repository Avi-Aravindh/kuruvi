import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock Convex hooks - must be before imports
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock generated API
vi.mock("../convex/_generated/api", () => ({
  api: {
    tasks: {
      list: "tasks:list",
      create: "tasks:create",
      moveToAgent: "tasks:moveToAgent",
      updateStatus: "tasks:updateStatus",
      deleteTask: "tasks:deleteTask",
      deleteAllByAgent: "tasks:deleteAllByAgent",
      deleteAllTasks: "tasks:deleteAllTasks",
    },
  },
}));

import Home from "./page";
import { useQuery, useMutation } from "convex/react";

describe("Home - Task Creation Race Condition", () => {
  const mockCreateTask = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue(mockCreateTask);
    mockCreateTask.mockResolvedValue(undefined);
  });

  it("should prevent duplicate task creation on rapid clicks", async () => {
    // Simulate slow network by delaying the mutation
    mockCreateTask.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Home />);

    // Open new task modal
    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    // Fill in task title
    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });

    // Get create button
    const createButton = screen.getByText("Create");

    // Simulate rapid clicks (5 times)
    fireEvent.click(createButton);
    fireEvent.click(createButton);
    fireEvent.click(createButton);
    fireEvent.click(createButton);
    fireEvent.click(createButton);

    // Wait for mutation to complete
    await waitFor(() => expect(mockCreateTask).toHaveBeenCalledTimes(1), {
      timeout: 200,
    });

    // Verify only one task was created
    expect(mockCreateTask).toHaveBeenCalledTimes(1);
    expect(mockCreateTask).toHaveBeenCalledWith({
      title: "Test Task",
      description: undefined,
      agent: "ada",
      priority: "medium",
      createdBy: "user",
    });
  });

  it("should disable create button during submission", async () => {
    mockCreateTask.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Home />);

    // Open new task modal
    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    // Fill in task title
    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });

    // Get create button
    const createButton = screen.getByText("Create");
    expect(createButton).not.toBeDisabled();

    // Click create
    fireEvent.click(createButton);

    // Button should show "Creating..." and be disabled
    await waitFor(() => {
      const button = screen.queryByText("Creating...");
      expect(button).toBeTruthy();
      expect(button).toBeDisabled();
    });

    // Wait for completion
    await waitFor(() => expect(mockCreateTask).toHaveBeenCalledTimes(1), {
      timeout: 200,
    });
  });

  it("should re-enable button after task creation completes", async () => {
    mockCreateTask.mockResolvedValue(undefined);

    render(<Home />);

    // Open new task modal
    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    // Fill in task title
    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });

    // Click create
    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    // Wait for modal to close (indicating task was created successfully)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("What needs to be done?")).toBeNull();
    });

    // Open modal again to verify button is enabled
    fireEvent.click(screen.getByText("New"));
    fireEvent.change(screen.getByPlaceholderText("What needs to be done?"), {
      target: { value: "Another Task" },
    });

    const newCreateButton = screen.getByText("Create");
    expect(newCreateButton).not.toBeDisabled();
  });
});

describe("TaskCard - Keyboard Navigation", () => {
  const mockTasks = [
    {
      _id: "task-1",
      title: "Test Task",
      description: "Test description",
      agent: "ada",
      priority: "medium",
      status: "queued",
      createdBy: "user",
      _creationTime: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue(mockTasks);
    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
  });

  it("should expand task card when Enter key is pressed", async () => {
    render(<Home />);

    const taskCard = screen.getByText("Test Task").closest("div");
    expect(taskCard).toBeTruthy();

    // Task should not be expanded initially
    expect(screen.queryByText("Test description")).toBeNull();

    // Press Enter key
    fireEvent.keyDown(taskCard!, { key: "Enter" });

    // Task should now be expanded
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });
  });

  it("should expand task card when Space key is pressed", async () => {
    render(<Home />);

    const taskCard = screen.getByText("Test Task").closest("div");
    expect(taskCard).toBeTruthy();

    // Task should not be expanded initially
    expect(screen.queryByText("Test description")).toBeNull();

    // Press Space key
    fireEvent.keyDown(taskCard!, { key: " " });

    // Task should now be expanded
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });
  });

  it("should not expand task card on other key presses", () => {
    render(<Home />);

    const taskCard = screen.getByText("Test Task").closest("div");
    expect(taskCard).toBeTruthy();

    // Press other keys
    fireEvent.keyDown(taskCard!, { key: "Escape" });
    fireEvent.keyDown(taskCard!, { key: "Tab" });
    fireEvent.keyDown(taskCard!, { key: "a" });

    // Task should remain collapsed
    expect(screen.queryByText("Test description")).toBeNull();
  });

  it("should have role=button and tabIndex=0 for keyboard accessibility", () => {
    render(<Home />);

    const taskCard = screen.getByText("Test Task").closest('[role="button"]');
    expect(taskCard).toBeTruthy();
    expect(taskCard).toHaveAttribute("tabIndex", "0");
  });

  it("should toggle task expansion on repeated Enter presses", async () => {
    render(<Home />);

    const taskCard = screen.getByText("Test Task").closest("div");
    expect(taskCard).toBeTruthy();

    // First press - expand
    fireEvent.keyDown(taskCard!, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    // Second press - collapse
    fireEvent.keyDown(taskCard!, { key: "Enter" });
    await waitFor(() => {
      expect(screen.queryByText("Test description")).toBeNull();
    });

    // Third press - expand again
    fireEvent.keyDown(taskCard!, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });
  });
});

describe("StatusIndicator - Loading Feedback", () => {
  const mockTasks = [
    {
      _id: "task-1",
      title: "Test Task",
      description: "Test description",
      agent: "ada",
      priority: "medium",
      status: "queued",
      createdBy: "user",
      _creationTime: Date.now(),
    },
  ];

  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue(mockTasks);
    (useMutation as ReturnType<typeof vi.fn>).mockImplementation((api) => {
      if (api === "tasks:updateStatus") return mockUpdateStatus;
      return vi.fn();
    });
    mockUpdateStatus.mockResolvedValue(undefined);
  });

  it("should prevent multiple status updates on rapid clicks", async () => {
    // Simulate slow network
    mockUpdateStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');

    // Rapid clicks (5 times)
    fireEvent.click(statusButton);
    fireEvent.click(statusButton);
    fireEvent.click(statusButton);
    fireEvent.click(statusButton);
    fireEvent.click(statusButton);

    // Wait for mutation to complete
    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalled(), {
      timeout: 200,
    });

    // Should only be called once
    expect(mockUpdateStatus).toHaveBeenCalledTimes(1);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      taskId: "task-1",
      status: "completed",
      agentName: "user",
    });
  });

  it("should show loading state during status update", async () => {
    mockUpdateStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');

    // Click to toggle status
    fireEvent.click(statusButton);

    // Button should be disabled during update
    await waitFor(() => {
      expect(statusButton).toBeDisabled();
    });

    // Wait for completion
    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledTimes(1), {
      timeout: 200,
    });
  });

  it("should toggle status from queued to completed", async () => {
    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        taskId: "task-1",
        status: "completed",
        agentName: "user",
      });
    });
  });

  it("should call updateStatus with correct parameters when completing a task", async () => {
    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        taskId: "task-1",
        status: "completed",
        agentName: "user",
      });
    });
  });

  it("should stop event propagation to prevent card expansion", async () => {
    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');

    // Task should not be expanded initially
    expect(screen.queryByText("Test description")).toBeNull();

    // Click status button
    fireEvent.click(statusButton);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Task should still be collapsed (event propagation was stopped)
    expect(screen.queryByText("Test description")).toBeNull();
  });

  it("should re-enable button after status update completes", async () => {
    mockUpdateStatus.mockResolvedValue(undefined);

    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');

    // Click to toggle status
    fireEvent.click(statusButton);

    // Wait for mutation to complete
    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledTimes(1));

    // Button should be enabled again (not disabled)
    expect(statusButton).not.toBeDisabled();
  });

  it("should have cursor:wait style when loading", async () => {
    mockUpdateStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<Home />);

    const statusButton = screen.getByLabelText('Mark task "Test Task" as complete');

    // Click to toggle status
    fireEvent.click(statusButton);

    // Button should have wait cursor during update
    await waitFor(() => {
      expect(statusButton).toHaveStyle({ cursor: "wait" });
    });

    // Wait for completion
    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledTimes(1), {
      timeout: 200,
    });
  });
});

describe("NewTaskModal - Validation Feedback", () => {
  const mockCreateTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue(mockCreateTask);
    mockCreateTask.mockResolvedValue(undefined);
  });

  it("should show validation message when title is empty", async () => {
    render(<Home />);

    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });
  });

  it("should show normal hint when title is provided", async () => {
    render(<Home />);

    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });

    await waitFor(() => {
      expect(screen.getByText("Press Enter to create")).toBeInTheDocument();
      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });
  });

  it("should disable create button when title is empty", async () => {
    render(<Home />);

    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    const createButton = screen.getByText("Create");
    expect(createButton).toBeDisabled();
  });

  it("should enable create button when title is provided", async () => {
    render(<Home />);

    const newButton = screen.getByText("New");
    fireEvent.click(newButton);

    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Test Task" } });

    const createButton = screen.getByText("Create");
    expect(createButton).not.toBeDisabled();
  });
});

describe("ConfirmModal - Delete Confirmation", () => {
  const mockTasks = [
    {
      _id: "task-1",
      title: "Test Task",
      description: "Test description",
      agent: "ada",
      priority: "medium",
      status: "queued",
      createdBy: "user",
      _creationTime: Date.now(),
    },
  ];

  const mockDeleteTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue(mockTasks);
    (useMutation as ReturnType<typeof vi.fn>).mockImplementation((api) => {
      if (api === "tasks:deleteTask") return mockDeleteTask;
      return vi.fn();
    });
    mockDeleteTask.mockResolvedValue(undefined);
  });

  it("should show confirmation modal when delete button is clicked", async () => {
    render(<Home />);

    // Expand task to show delete button
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);

    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    // Click delete button
    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
      expect(screen.getByText("This action cannot be undone.")).toBeTruthy();
    });
  });

  it("should delete task when confirm is clicked", async () => {
    render(<Home />);

    // Expand task and click delete
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Click confirm in modal
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    // Get all delete buttons and select the one in the modal (second one)
    const confirmButton = screen.getAllByText("Delete")[1];
    fireEvent.click(confirmButton);

    // Delete mutation should be called
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith({ taskId: "task-1" });
    });
  });

  it("should not delete task when cancel is clicked", async () => {
    render(<Home />);

    // Expand task and click delete
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Click cancel in modal
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Delete mutation should NOT be called
    expect(mockDeleteTask).not.toHaveBeenCalled();

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText("Delete this task?")).toBeNull();
    });
  });

  it("should close modal on Escape key", async () => {
    render(<Home />);

    // Expand task and click delete
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Modal should close and delete should not be called
    await waitFor(() => {
      expect(screen.queryByText("Delete this task?")).toBeNull();
    });
    expect(mockDeleteTask).not.toHaveBeenCalled();
  });

  it("should confirm deletion on Enter key", async () => {
    render(<Home />);

    // Expand task and click delete
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    // Press Enter
    fireEvent.keyDown(window, { key: "Enter" });

    // Delete should be called
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith({ taskId: "task-1" });
    });
  });

  it("should close modal when clicking backdrop", async () => {
    render(<Home />);

    // Expand task and click delete
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    // Find and click the backdrop (the overlay div)
    const backdrop = screen.getByText("Delete this task?").closest(".fixed");
    fireEvent.click(backdrop!);

    // Modal should close and delete should not be called
    await waitFor(() => {
      expect(screen.queryByText("Delete this task?")).toBeNull();
    });
    expect(mockDeleteTask).not.toHaveBeenCalled();
  });

  it("should not propagate click event from delete button to task card", async () => {
    render(<Home />);

    // Expand task first
    const taskCard = screen.getByText("Test Task").closest("div");
    fireEvent.click(taskCard!);
    await waitFor(() => {
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    // Click delete button
    const deleteButton = screen.getByLabelText("Delete task");
    fireEvent.click(deleteButton);

    // Modal should appear (not task card collapsing)
    await waitFor(() => {
      expect(screen.getByText("Delete this task?")).toBeTruthy();
    });

    // Task should still be expanded
    expect(screen.getByText("Test description")).toBeTruthy();
  });
});
