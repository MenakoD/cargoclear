"use client";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
export function Workflow({ de = false }: { de?: boolean }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = Math.min(3, Math.floor(f / (fps * 2)));
  return (
    <AbsoluteFill
      style={{
        background: "#142f29",
        color: "#fff",
        padding: 38,
        fontFamily: "Arial",
      }}
    >
      <div style={{ fontSize: 14, color: "#b4d6b8", letterSpacing: 3 }}>
        CARGOCLEAR / {de ? "DER ABLAUF" : "THE WORKFLOW"}
      </div>
      <div style={{ fontSize: 35, marginTop: 23 }}>
        {
          (de
            ? [
                "Dokument erfassen.",
                "Angaben vergleichen.",
                "Abweichungen erkennen.",
                "Mit Überblick prüfen.",
              ]
            : [
                "Capture the document.",
                "Connect the details.",
                "Spot the differences.",
                "Review with confidence.",
              ])[step]
        }
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 38 }}>
        {["01", "02", "03", "04"].map((n, i) => (
          <div
            key={n}
            style={{
              flex: 1,
              borderTop: "2px solid " + (i <= step ? "#c4e89e" : "#476158"),
              paddingTop: 16,
              color: i <= step ? "#c4e89e" : "#718d80",
              translate: `0px ${interpolate(f, [i * fps * 2, i * fps * 2 + 20], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            }}
          >
            <div style={{ fontSize: 30 }}>{n}</div>
            <div style={{ fontSize: 15, marginTop: 12 }}>
              {
                (de
                  ? ["Erfassen", "Vergleichen", "Markieren", "Prüfen"]
                  : ["Capture", "Compare", "Flag", "Review"])[i]
              }
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 26, fontSize: 13, color: "#b2c5bc" }}>
        {de
          ? "Jede Freigabe bleibt eine bewusste menschliche Entscheidung."
          : "Every approval stays a considered human decision."}
      </div>
    </AbsoluteFill>
  );
}
