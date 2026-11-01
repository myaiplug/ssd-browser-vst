import { Suite } from "@/components/vst/suite";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Suite />;
}
