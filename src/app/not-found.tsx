import { TextLink } from "@/components/ui/TextLink";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-[100dvh] flex-col justify-center">
      <p className="voice text-[clamp(2rem,4.5vw,4.5rem)] text-primary">This room does not exist.</p>
      <p className="body-copy mt-6">The page you asked for is not in the atelier.</p>
      <div className="mt-10">
        <TextLink href="/" cursor="Go">
          Back to the mark
        </TextLink>
      </div>
    </main>
  );
}
