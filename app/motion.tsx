"use client";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import narration from "./workflow-narration.json";

// The metadata is measured from the committed MP3s. One timeline controls
// the narration, the highlighted stage and the captions, including seeking.
export function Workflow({
  de = false,
  audioBase = "/audio/workflow-ryan",
}: {
  de?: boolean;
  audioBase?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = narration.segments.reduce(
    (current, segment, index) =>
      frame >= Math.round(segment.startSeconds * fps) ? index : current,
    0,
  );
  return (
    <AbsoluteFill
      style={{
        background: "#142f29",
        color: "#fff",
        padding: 38,
        fontFamily: "Arial",
      }}
    >
      {narration.segments.map((segment) => (
        <Audio
          key={segment.id}
          name={"Ryan / " + segment.id}
          src={audioBase + "/" + segment.file}
          from={Math.round(segment.startSeconds * fps)}
          durationInFrames={Math.ceil(segment.audioSeconds * fps)}
          premountFor={fps}
        />
      ))}
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
      <div style={{ display: "flex", gap: 18, marginTop: 32 }}>
        {["01", "02", "03", "04"].map((number, index) => (
          <div
            key={number}
            style={{
              flex: 1,
              borderTop: "2px solid " + (index <= step ? "#c4e89e" : "#476158"),
              paddingTop: 16,
              color: index <= step ? "#c4e89e" : "#718d80",
              translate: `0px ${interpolate(frame, [narration.segments[index].startSeconds * fps, narration.segments[index].startSeconds * fps + 20], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            }}
          >
            <div style={{ fontSize: 30 }}>{number}</div>
            <div style={{ fontSize: 15, marginTop: 12 }}>
              {
                (de
                  ? ["Erfassen", "Vergleichen", "Markieren", "Prüfen"]
                  : ["Capture", "Compare", "Flag", "Review"])[index]
              }
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 38,
          right: 38,
          top: 265,
          fontSize: 17,
          lineHeight: 1.55,
          color: "#e5efdf",
          borderLeft: "2px solid #789b63",
          paddingLeft: 14,
        }}
        aria-live="off"
      >
        {de ? narration.segments[step].german : narration.segments[step].text}
      </div>
      <div
        style={{
          position: "absolute",
          left: 38,
          right: 38,
          bottom: 60,
          fontSize: 11,
          color: "#a6bdb0",
        }}
      >
        {de
          ? "Englische Sprecherstimme: Microsoft Ryan · Die abschließende Entscheidung trifft ein Mensch."
          : "English narration: Microsoft Ryan · A person makes the final decision."}
      </div>
    </AbsoluteFill>
  );
}
