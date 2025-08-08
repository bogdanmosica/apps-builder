---
description: 'React Query (TanStack Query) best practices and development standards'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts'
---

# React Query Best Practices Guide

Comprehensive guide for using React Query (TanStack Query v5) effectively in modern React applications, based on TkDodo's expert insights and official documentation.

## Project Context
- React Query v5+ (TanStack Query)
- TypeScript for type safety
- Next.js 15+ with App Router
- Server-side rendering support
- Client-side data fetching and caching
- Real-time data synchronization

## Workspace Integration

> **📋 Reference**: For comprehensive workspace dependency patterns, see [React Best Practices - Workspace Dependencies](./reactjs-best-practices.instructions.md#workspace-dependencies).

React Query integrates seamlessly with workspace packages:

```typescript
import { User, Product } from '@workspace/types';
import { userSchema } from '@workspace/validations';
import { Button } from '@workspace/ui/components/button';

// Type-safe query with workspace types
export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      return userSchema.parse(data); // Validate with workspace schema
    },
  });
}
```

## Core Principles

### 1. Understand staleTime vs gcTime (cacheTime)
- **staleTime**: How long data is considered fresh (default: 0ms)
- **gcTime**: How long unused data stays in cache (default: 5 minutes)
- Set appropriate staleTime to reduce unnecessary refetches
- Use longer staleTime for stable data, shorter for frequently changing data

### 2. Separate Server State from Client State
- Use React Query exclusively for server state
- Keep client-only state in useState/useReducer
- Don't try to sync server state with client state manually
- Let React Query handle the synchronization

### 3. Query Keys as Dependencies
- Treat query keys as dependencies for your queries
- Use arrays for structured query keys: `['todos', { status: 'done' }]`
- Organize keys hierarchically for effective invalidation
- Co-locate query keys with their related functions

## Query Key Management

### Effective Query Key Structure
```typescript
// ❌ Simple strings - hard to manage
const todoQuery = 'todos'

// ✅ Structured arrays with hierarchy
const queryKeys = {
  all: ['todos'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: string) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: number) => [...queryKeys.details(), id] as const,
}
```

### Query Key Factories
```typescript
// Create centralized query key factory
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
}

// Use in components
function TodoList({ filters }: { filters: TodoFilters }) {
  const { data: todos } = useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => fetchTodos(filters),
  })
  
  return <div>{/* render todos */}</div>
}
```

## Data Fetching Patterns

### Custom Hooks for Reusability
```typescript
// Create custom hooks for each data type
export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters || {}),
    queryFn: () => fetchTodos(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTodo(id: number) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => fetchTodo(id),
    enabled: !!id,
  })
}
```

### Data Transformations
```typescript
// ✅ Transform in select for better caching
function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select: (data) => data.map(todo => ({
      ...todo,
      completed: !!todo.completed
    })),
  })
}

// ✅ Transform in queryFn when transformation is expensive
function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const data = await fetchTodos()
      return data.map(processComplexTransformation)
    },
  })
}
```

## TypeScript Integration

### Type-Safe Queries
```typescript
interface Todo {
  id: number
  title: string
  completed: boolean
}

interface TodoFilters {
  status?: 'all' | 'active' | 'completed'
  search?: string
}

// Type the query function
async function fetchTodos(filters?: TodoFilters): Promise<Todo[]> {
  const response = await fetch(`/api/todos?${new URLSearchParams(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch todos')
  return response.json()
}

// Use in hook with proper typing
export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters || {}),
    queryFn: () => fetchTodos(filters),
    staleTime: 5 * 60 * 1000,
  })
}
```

### Error Handling with Types
```typescript
interface ApiError {
  message: string
  code: string
  statusCode: number
}

export function useTodos() {
  return useQuery<Todo[], ApiError>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false
      }
      return failureCount < 3
    },
  })
}
```

## Mutations and Optimistic Updates

### Basic Mutations
```typescript
export function useCreateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
    onError: (error) => {
      // Handle error (show toast, log, etc.)
      console.error('Failed to create todo:', error)
    },
  })
}
```

### Optimistic Updates
```typescript
export function useUpdateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (updatedTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(updatedTodo.id) })
      
      // Snapshot previous value
      const previousTodo = queryClient.getQueryData(todoKeys.detail(updatedTodo.id))
      
      // Optimistically update
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo)
      
      return { previousTodo, updatedTodo }
    },
    onError: (err, updatedTodo, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(
          todoKeys.detail(updatedTodo.id),
          context.previousTodo
        )
      }
    },
    onSettled: (updatedTodo) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(updatedTodo?.id) })
    },
  })
}
```

## Status Handling and UX

### Proper Status Checks
```typescript
function TodoList() {
  const { data, error, isPending, isError } = useTodos()
  
  // ✅ Check for data first when possible
  if (data) {
    return (
      <div>
        {data.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    )
  }
  
  // Then check for error
  if (isError) {
    return <div>Error: {error.message}</div>
  }
  
  // Finally show loading
  if (isPending) {
    return <div>Loading...</div>
  }
  
  return null
}
```

### Background Updates
```typescript
function TodoList() {
  const { data, isFetching, isLoading } = useTodos()
  
  return (
    <div>
      {/* Show loading spinner for initial load */}
      {isLoading && <Spinner />}
      
      {/* Show subtle indicator for background refetch */}
      {isFetching && !isLoading && (
        <div className="bg-blue-100 text-sm p-2">Updating...</div>
      )}
      
      {data?.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
```

## Performance Optimization

### Render Optimization
```typescript
// ✅ Use select to subscribe to specific data slices
function TodoCount() {
  const todoCount = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select: (data) => data.length, // Only re-render when count changes
  })
  
  return <div>Total todos: {todoCount.data}</div>
}

// ✅ Use tracked queries for automatic optimization
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: 'tracked', // Only re-render when used properties change
    },
  },
})
```

### Infinite Queries
```typescript
export function useInfiniteTodos() {
  return useInfiniteQuery({
    queryKey: ['todos', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchTodos({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    initialPageParam: 0,
  })
}

function InfiniteTodoList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTodos()
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

## Error Handling

### Global Error Handling
```typescript
// Error boundary for React Query errors
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              There was an error!
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <TodoApp />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

### Query-Specific Error Handling
```typescript
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error.status === 404) return false
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

## Testing Best Practices

### Test Setup
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for tests
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  })
}

function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

### Testing Queries
```typescript
import { waitFor } from '@testing-library/react'

test('displays todos', async () => {
  const mockTodos = [
    { id: 1, title: 'Test todo', completed: false }
  ]
  
  // Mock the API
  server.use(
    rest.get('/api/todos', (req, res, ctx) => {
      return res(ctx.json(mockTodos))
    })
  )
  
  renderWithClient(<TodoList />)
  
  await waitFor(() => {
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })
})
```

## Advanced Patterns

### Dependent Queries
```typescript
function UserProfile({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })
  
  const { data: userPosts } = useQuery({
    queryKey: ['posts', { userId }],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!user, // Only fetch posts when user is loaded
  })
  
  return <div>{/* render user and posts */}</div>
}
```

### Prefetching
```typescript
export function usePrefetchTodo() {
  const queryClient = useQueryClient()
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: todoKeys.detail(id),
      queryFn: () => fetchTodo(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

function TodoListItem({ todo }: { todo: Todo }) {
  const prefetchTodo = usePrefetchTodo()
  
  return (
    <div
      onMouseEnter={() => prefetchTodo(todo.id)}
      onClick={() => navigate(`/todos/${todo.id}`)}
    >
      {todo.title}
    </div>
  )
}
```

### WebSocket Integration
```typescript
export function useRealtimeTodos() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/todos')
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      if (message.type === 'TODO_UPDATED') {
        queryClient.setQueryData(
          todoKeys.detail(message.todo.id),
          message.todo
        )
        
        // Invalidate list to ensure consistency
        queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      }
    }
    
    return () => ws.close()
  }, [queryClient])
  
  return useTodos()
}
```

## Configuration and Setup

### Query Client Setup
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false, // Disable in development
    },
  },
})
```

### DevTools Setup
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## Common Anti-Patterns to Avoid

### ❌ Don't use React Query for client state
```typescript
// ❌ Bad: Using React Query for client-only state
const { data: isModalOpen, mutate: setModalOpen } = useMutation({
  mutationFn: (open: boolean) => Promise.resolve(open),
})

// ✅ Good: Use useState for client state
const [isModalOpen, setModalOpen] = useState(false)
```

### ❌ Don't ignore the enabled option
```typescript
// ❌ Bad: Query runs even when data is not needed
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})

// ✅ Good: Only run when userId is available
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,
})
```

### ❌ Don't use mutateAsync unless you need it
```typescript
// ❌ Bad: Using mutateAsync without proper error handling
const mutation = useMutation({ mutationFn: createTodo })

const handleSubmit = async (data: TodoData) => {
  await mutation.mutateAsync(data) // Can throw unhandled errors
  navigate('/todos')
}

// ✅ Good: Use mutate with callbacks
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => navigate('/todos'),
  onError: (error) => showError(error.message),
})

const handleSubmit = (data: TodoData) => {
  mutation.mutate(data)
}
```

## Resources and Further Reading

- [TkDodo's Blog Series](https://tkdodo.eu/blog/practical-react-query) - Essential reading for React Query mastery
- [Official React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Query Examples Repository](https://github.com/TanStack/query/tree/main/examples/react)
- [Testing React Query Guide](https://tkdodo.eu/blog/testing-react-query)

This guide covers the most important patterns and best practices for React Query. Always refer to the official documentation and TkDodo's blog for the latest insights and advanced techniques.