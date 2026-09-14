"use client";

import { useRouter } from "next/navigation";

export default function ClickableRow({ href, className, children }) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer ${className ?? ""}`}
    >
      {children}
    </tr>
  );
}
