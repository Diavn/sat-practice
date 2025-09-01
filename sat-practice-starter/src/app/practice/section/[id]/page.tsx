import Player from "@/src/components/Player";

export default function Page({ params }: { params: { id: string }}) {
  return <Player sectionId={Number(params.id)} />;
}
