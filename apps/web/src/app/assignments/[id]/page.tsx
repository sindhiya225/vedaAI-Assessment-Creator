import { OutputClient } from "./OutputClient";

export default async function OutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OutputClient id={id} />;
}
