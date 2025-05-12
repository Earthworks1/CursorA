import { Suspense, lazy, ComponentType } from "react";

interface DynamicProps {
  children: () => Promise<{ default: ComponentType<any> }>;
}

export default function Dynamic({ children }: DynamicProps) {
  const Component = lazy(() => children().then(mod => ({ default: mod.default })));
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}