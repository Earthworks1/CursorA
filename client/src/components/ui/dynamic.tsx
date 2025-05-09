import { Suspense } from "react";

interface DynamicProps {
  children: () => Promise<{ default: React.ComponentType<any> }>;
}

export default function Dynamic({ children }: DynamicProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children()}
    </Suspense>
  );
}