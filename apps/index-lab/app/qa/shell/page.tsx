import ShellSpike from "./ShellSpike";

interface ShellSpikePageProps {
  searchParams: Promise<{ length?: string }>;
}

export default async function ShellSpikePage({ searchParams }: ShellSpikePageProps) {
  const params = await searchParams;
  return <ShellSpike long={params.length !== "short"} />;
}
