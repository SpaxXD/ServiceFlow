# ServiceFlow Frontend

A modern React application for managing clients and services with a clean, professional UI.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Setup environment variables**:
```bash
cp .env.example .env
```

3. **Update .env if backend runs on different URL**:
```env
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

Application runs on: `http://localhost:5173`

The dev server includes:
- Hot module reloading (HMR)
- Fast refresh for React components
- Automatic browser opening

### Building

Build for production:
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/            # Reusable UI components
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── Toast.tsx
│   └── Skeleton.tsx
├── pages/                 # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ClientsPage.tsx
│   └── ServicesPage.tsx
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useServices.ts
│   └── useToast.tsx
├── forms/                 # Form components
│   ├── LoginForm.tsx
│   ├── ClientForm.tsx
│   └── ServiceForm.tsx
├── services/              # API integration
│   └── api.ts
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
├── App.tsx                # Main app component
├── main.tsx               # Entry point
└── index.css              # Tailwind CSS
```

## Features

### Authentication
- Login with email/password
- Register new accounts
- Session management with refresh tokens
- Protected routes
- Role-based navigation

### Clients Management
- Create, read, update, delete clients
- Search functionality
- Pagination (10 items per page)
- Responsive table layout

### Services Management
- Create, read, update, delete services
- Filter by status and client
- Search functionality
- Service value tracking
- Status indicators (colors)

### Dashboard
- Real-time metrics
- Total clients count
- Total services count
- Services breakdown by status
- Total revenue calculation
- Quick statistics

### UX Features
- Toast notifications (success, error, info)
- Loading skeletons
- Responsive design
- Permission-based UI (hide actions based on role)
- Smooth transitions and animations

## Testing

### Run Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Environment Variables

```env
# API Base URL
VITE_API_URL=http://localhost:3000
```

## Key Libraries

- **React 18**: UI framework
- **Vite**: Build tool (lightning fast)
- **React Router v6**: Client-side routing
- **TanStack Query**: Data fetching & caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

## Component Examples

### Protected Route
```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

Only authenticated users can access.

### Toast Notification
```tsx
const { addToast } = useToast();
addToast('Operation successful', 'success');
addToast('Something went wrong', 'error');
```

### Query & Mutation
```tsx
const { data: clients, isLoading } = useClients(page, pageSize);
const createMutation = useCreateClient();

const handleCreate = async (data) => {
  await createMutation.mutateAsync(data);
};
```

## State Management

- **TanStack Query**: Server state (API data)
- **React Hooks**: UI state (forms, modals)
- **localStorage**: Auth tokens and user info
- **Context API**: Toast notifications

## Styling

Uses Tailwind CSS with custom component classes:
- `.btn-primary`: Blue button
- `.btn-secondary`: Gray button
- `.input-field`: Styled input
- `.card`: Rounded card with shadow

## API Integration

The `api.ts` service includes:
- Base Axios instance with authentication
- Automatic token injection in headers
- Automatic token refresh on 401
- Error handling with proper propagation

```typescript
// Automatic auth header injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh
api.interceptors.response.use(response => response, async (error) => {
  if (error.response?.status === 401) {
    // Refresh token and retry
  }
});
```

## Performance Optimizations

- Code splitting with React Router
- Image lazy loading
- CSS minification
- Tree shaking of unused code
- Query result caching
- Skeleton loaders for better UX

## Accessibility

- Semantic HTML
- aria labels for icons
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Common Tasks

### Add a new page
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Protect route if needed with `<ProtectedRoute>`

### Add a new form
1. Create form component in `src/forms/`
2. Use React Hook Form + Zod
3. Import and use in page

### Add an API endpoint
1. Add method in `src/services/api.ts`
2. Create custom hook in `src/hooks/`
3. Use hook in component

### Add a new component
1. Create in `src/components/`
2. Props should be TypeScript typed
3. Use Tailwind classes for styling

## Deployment

### Build for production
```bash
npm run build
```

### Deploy static files
The `dist/` folder contains all production files. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

### Environment for production
```env
VITE_API_URL=https://api.yourdomain.com
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API requests failing
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors
- Verify JWT token is valid

### Styling issues
- Clear `.next` folder if exists
- Run `npm run build` again
- Check Tailwind config is correct

### Hot reload not working
- Restart dev server
- Check file save is working
- Verify Vite plugin config

### Memory issues
- Restart dev server
- Check for memory leaks in browser DevTools
- Reduce number of open tabs

## Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Create reusable components
4. Write tests for utilities and hooks
5. Keep components small and focused
6. Use meaningful variable names
7. Document complex logic

## Performance Tips

1. Use `useCallback` for event handlers passed to children
2. Use `useMemo` for expensive computations
3. Split large forms into smaller components
4. Use pagination for large lists
5. Lazy load images and components
6. Monitor bundle size with `npm run build`

## Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
