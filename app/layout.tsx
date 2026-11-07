import "./globals.css";
export const metadata = {
  title: "CargoClear · Customs workspace",
  description:
    "A clearer arrival. Air cargo shipment checks and an automation learning lab.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
