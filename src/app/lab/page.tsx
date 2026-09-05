import { notFound } from "next/navigation";
import { LabClient } from "./LabClient";

export const metadata = { title: "Lab", robots: { index: false } };

// Motion tools demo. Development only.
export default function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabClient />;
}
