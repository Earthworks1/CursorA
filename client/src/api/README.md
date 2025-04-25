# API Documentation

This document provides an overview of the available API endpoints and their usage.

## Table of Contents

- [Workload API](#workload-api)
- [Tags API](#tags-api)
- [Sous-Tâches API](#sous-tâches-api)

## Workload API

The Workload API provides endpoints for managing tasks and their workload.

### Endpoints

#### `getAll()`
- **Description**: Fetches all tasks
- **Returns**: `Promise<Task[]>`
- **Example**:
```typescript
const tasks = await workloadApi.getAll();
```

#### `getById(id: string)`
- **Description**: Fetches a specific task by ID
- **Parameters**:
  - `id`: The ID of the task to fetch
- **Returns**: `Promise<Task>`
- **Example**:
```typescript
const task = await workloadApi.getById('123');
```

#### `create(task: Task)`
- **Description**: Creates a new task
- **Parameters**:
  - `task`: The task object to create
- **Returns**: `Promise<Task>`
- **Example**:
```typescript
const newTask = await workloadApi.create({
  title: 'New Task',
  description: 'Task description',
  startTime: new Date(),
  endTime: new Date(),
  resourceId: '1',
  status: 'pending',
  priority: 'medium'
});
```

#### `update(id: string, updates: Partial<Task>)`
- **Description**: Updates an existing task
- **Parameters**:
  - `id`: The ID of the task to update
  - `updates`: Partial task object containing the fields to update
- **Returns**: `Promise<Task>`
- **Example**:
```typescript
const updatedTask = await workloadApi.update('123', {
  title: 'Updated Title',
  status: 'completed'
});
```

#### `delete(id: string)`
- **Description**: Deletes a task
- **Parameters**:
  - `id`: The ID of the task to delete
- **Returns**: `Promise<void>`
- **Example**:
```typescript
await workloadApi.delete('123');
```

## Tags API

The Tags API provides endpoints for managing task tags.

### Endpoints

#### `getAll()`
- **Description**: Fetches all tags
- **Returns**: `Promise<Tag[]>`
- **Example**:
```typescript
const tags = await tagsApi.getAll();
```

#### `create(tag: Tag)`
- **Description**: Creates a new tag
- **Parameters**:
  - `tag`: The tag object to create
- **Returns**: `Promise<Tag>`
- **Example**:
```typescript
const newTag = await tagsApi.create({
  name: 'New Tag',
  color: '#FF0000'
});
```

#### `delete(id: string)`
- **Description**: Deletes a tag
- **Parameters**:
  - `id`: The ID of the tag to delete
- **Returns**: `Promise<void>`
- **Example**:
```typescript
await tagsApi.delete('123');
```

## Sous-Tâches API

The Sous-Tâches API provides endpoints for managing subtasks.

### Endpoints

#### `getByTache(tacheId: number)`
- **Description**: Fetches all subtasks for a specific task
- **Parameters**:
  - `tacheId`: The ID of the parent task
- **Returns**: `Promise<SousTache[]>`
- **Example**:
```typescript
const sousTaches = await sousTachesApi.getByTache(123);
```

#### `create(sousTache: SousTache)`
- **Description**: Creates a new subtask
- **Parameters**:
  - `sousTache`: The subtask object to create
- **Returns**: `Promise<SousTache>`
- **Example**:
```typescript
const newSousTache = await sousTachesApi.create({
  tacheId: 123,
  titre: 'New Subtask',
  completed: false
});
```

#### `update(id: number, updates: Partial<SousTache>)`
- **Description**: Updates an existing subtask
- **Parameters**:
  - `id`: The ID of the subtask to update
  - `updates`: Partial subtask object containing the fields to update
- **Returns**: `Promise<SousTache>`
- **Example**:
```typescript
const updatedSousTache = await sousTachesApi.update(123, {
  titre: 'Updated Subtask',
  completed: true
});
```

#### `delete(id: number)`
- **Description**: Deletes a subtask
- **Parameters**:
  - `id`: The ID of the subtask to delete
- **Returns**: `Promise<void>`
- **Example**:
```typescript
await sousTachesApi.delete(123);
```

## Error Handling

All API endpoints throw errors when the request fails. The error message will include details about what went wrong. It's recommended to wrap API calls in try-catch blocks:

```typescript
try {
  const tasks = await workloadApi.getAll();
} catch (error) {
  console.error('Failed to fetch tasks:', error);
  // Handle error appropriately
}
```

## Type Definitions

All API endpoints use TypeScript types for type safety. The main types are:

- `Task`: Represents a task in the workload
- `Tag`: Represents a task tag
- `SousTache`: Represents a subtask

These types are defined in `src/types/schema.ts`. 