//app/admin/users/[id]/page.tsx
interface PageProps {
  params: { id: string };
}

export default function UserDetailsPage({ params }: PageProps) {
  return (
    <div>
      <h1>User Details</h1>
      <p>User ID: {params.id}</p>
      <p>This page is under construction.</p>
    </div>
  );
}