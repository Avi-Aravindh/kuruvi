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
