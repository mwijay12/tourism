import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Kibo & Plains",
  description:
    "Firebase Google Auth, Firestore expeditions & inquiries, Cloudinary Media Studio, and Nodemailer dispatch console.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
