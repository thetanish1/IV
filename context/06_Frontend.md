# 06 Frontend Architecture

## Tech Stack
- Next.js 15 (App Router)
- React 19 & TypeScript
- TailwindCSS for styling
- React Hook Form + Zod for strict form validation
- TanStack Query (React Query) for API data fetching and state caching

## Route Structure
- `/` - Public Landing Page
- `/courses` - Course Listing with Search & Filters
- `/courses/[id]` - Course Detail Page & Razorpay Checkout Modal
- `/apply` - Internship Application Form (1, 3, 6 Months selection)
- `/contact` - Contact Us page
- `/success` - Payment / Application Confirmation Receipt
- `/error` - Transaction Error page
- `/admin/login` - Admin Login Screen
- `/admin/dashboard` - Admin Dashboard (Overview Stats, Applications Table, Registrations Table, Payments Table, Excel Export triggers)
