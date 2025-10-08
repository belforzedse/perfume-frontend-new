"use client";

import { useEffect, useState } from "react";
import { API_URL, getPerfumes, type Perfume } from "@/lib/api";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === "string") {
    return err;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
};

export default function ApiTestPage() {
  const [status, setStatus] = useState("Testing...");
  const [error, setError] = useState<string | null>(null);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);

  useEffect(() => {
    async function test() {
      try {
        setStatus("Checking environment variables...");
        console.log("API_URL:", API_URL);
        console.log("Requests are proxied through /api/strapi");

        setStatus("Fetching perfumes via proxy...");
        const data = await getPerfumes();

        console.log("Got perfumes:", data.length);
        setPerfumes(data);
        setStatus(`Success! Got ${data.length} perfumes`);
      } catch (err: unknown) {
        console.error("Error:", err);
        setError(getErrorMessage(err));
        setStatus("Failed");
      }
    }

    test();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>API Connection Test</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Environment Variables</h2>
        <p>API_URL: {API_URL || "NOT SET"}</p>
        <p>Token exposed to browser: خیر (proxy protects it)</p>
      </div>
      <div>
        <h2>Status: {status}</h2>
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {perfumes.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Perfumes ({perfumes.length}):</h3>
            <ul>
              {perfumes.slice(0, 5).map((p) => (
                <li key={p.id}>
                  {p.nameFa || p.nameEn} - {p.brand}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
