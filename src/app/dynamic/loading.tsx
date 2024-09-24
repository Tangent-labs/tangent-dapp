// This component will be loaded by defaut during the execution
// of the sibbling  page.tsx
// it has to be named : 'loading.{ext}'

import Loader from "@/components/Loader";

export default function Loading() {
  return <Loader />;
}
