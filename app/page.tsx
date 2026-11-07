"use client";
import { useState, useEffect, useRef } from "react";
import { Player } from "@remotion/player";
import { Workflow } from "./motion";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  FlaskConical,
  BookOpen,
  ArrowUpRight,
  Plus,
  Search,
  Upload,
  ScanLine,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock,
  FileText,
  X,
  ChevronRight,
  Download,
  Plane,
  Settings2,
  Code2,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { flags, type Shipment } from "../lib/checks";
import { readPracticeJson } from "../lib/intake";
type ApiResponse = {
  error?: string;
  shipments: Shipment[];
  key: string;
  name: string;
  feedback: any[];
};
const samples: Shipment[] = [
  {
    id: "demo1",
    mawb: "020-12345675",
    route: "FRA → JFK",
    pieces: "24",
    weight: "1240",
    manifestPieces: "22",
    manifestWeight: "1240",
    mrn: "",
    procedure: "T1",
    status: "review",
    checks: [true, false, false, false, false],
    documents: [],
    history: ["Practice data loaded"],
    demo: true,
  },
  {
    id: "demo2",
    mawb: "020-87654321",
    route: "AMS → FRA",
    pieces: "12",
    weight: "680",
    manifestPieces: "12",
    manifestWeight: "680",
    mrn: "26DE12345678901234",
    procedure: "T1",
    status: "pending",
    checks: [true, true, false, false, false],
    documents: [],
    history: ["Practice data loaded"],
    demo: true,
  },
  {
    id: "demo3",
    mawb: "057-45678901",
    route: "CDG → FRA",
    pieces: "8",
    weight: "320",
    manifestPieces: "8",
    manifestWeight: "320",
    mrn: "26FR12345678901234",
    procedure: "T1",
    status: "approved",
    checks: [true, true, true, true, true],
    documents: [],
    history: ["Fictional human review completed"],
    demo: true,
  },
];

// The main workspace combines a few independent learning modules.
// State remembers what is currently on screen; API requests save lasting records.
export default function Home() {
  const [de, setGerman] = useState(false),
    [page, setPage] = useState("overview"),
    [rows, setShipments] = useState<Shipment[]>([]),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [modal, setModal] = useState<string | null>(null),
    [active, setActiveShipment] = useState<Shipment | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [reveal, setExplanationVisible] = useState(false),
    [lesson, setLesson] = useState(0),
    [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const video = useRef<HTMLVideoElement>(null),
    scanner = useRef<any>(null);
  const t = (en: string, ge: string) => (de ? ge : en);
  useEffect(() => {
    setGerman(localStorage.getItem("cargo-language") === "de");
    fetch("/api/shipments")
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((d) => {
        if (d.error) throw Error(d.error);
        setShipments(d.shipments);
      })
      .catch((e) => setNotice(e.message));
    return () => scanner.current?.stop();
  }, []);
  useEffect(() => {
    document.documentElement.lang = de ? "de" : "en";
    localStorage.setItem("cargo-language", de ? "de" : "en");
  }, [de]);
  useEffect(() => {
    if (notice) {
      const x = setTimeout(() => setNotice(""), 7000);
      return () => clearTimeout(x);
    }
  }, [notice]);
  // Save only after the server confirms success. Fictional samples stay in memory.
  async function save(s: Shipment) {
    setBusy(true);
    try {
      if (!s.demo) {
        const r = await fetch("/api/shipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        });
        const d = (await r.json()) as ApiResponse;
        if (!r.ok) throw Error(d.error);
      }
      setShipments((old) => [s, ...old.filter((x) => x.id !== s.id)]);
      setActiveShipment(s);
      setNotice(t("Saved successfully", "Erfolgreich gespeichert"));
      return true;
    } catch (e) {
      setNotice(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  function blank() {
    setActiveShipment({
      id: crypto.randomUUID(),
      mawb: "",
      route: "",
      pieces: "",
      weight: "",
      manifestPieces: "",
      manifestWeight: "",
      mrn: "",
      procedure: "T1",
      status: "pending",
      checks: [false, false, false, false, false],
      documents: [],
      history: [],
    });
    setModal("new");
  }
  function edit(s: Shipment) {
    setActiveShipment({ ...s, checks: [...s.checks] });
    setModal("detail");
  }
  function download(name: string, content: string, type = "application/json") {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // This version stores the document. OCR can be added as a separate later module.
  async function upload(file: File) {
    if (!active) return;
    setBusy(true);
    try {
      const imported = file.name.toLowerCase().endsWith(".json")
        ? readPracticeJson(await file.text())
        : {};
      const data = new FormData();
      data.append("file", file);
      const r = await fetch("/api/documents", { method: "POST", body: data });
      const d = (await r.json()) as ApiResponse;
      if (!r.ok) throw Error(d.error);
      const s = {
        ...active,
        ...imported,
        status: "pending",
        checks: [false, false, false, false, false],
        documents: [...active.documents, d],
        history: [
          ...active.history,
          new Date().toISOString() + " · " + file.name,
        ],
      };
      setActiveShipment(s);
      if (!s.demo && /^\d{3}-\d{8}$/.test(s.mawb)) await save(s);
      else if (s.demo)
        setShipments((old) => old.map((x) => (x.id === s.id ? s : x)));
      setNotice(
        t(
          "Attached. JSON fields are filled when supplied; verify the details below.",
          "Angehängt. JSON-Felder wurden übernommen; Angaben unten prüfen.",
        ),
      );
    } catch (e) {
      setNotice(String(e));
    } finally {
      setBusy(false);
    }
  }
  // A barcode identifies a record; it does not establish customs status.
  function findCode(code: string) {
    const match = code.match(/\b\d{3}[- ]?\d{8}\b/);
    if (!match) {
      scanner.current?.stop();
      blank();
      setActiveShipment((s) =>
        s
          ? {
              ...s,
              history: [
                new Date().toISOString() +
                  " · Scanned source reference: " +
                  code.slice(0, 200),
              ],
            }
          : s,
      );
      setNotice(
        t(
          "Reference captured. Enter the related MAWB to link this CMR or manifest.",
          "Referenz erfasst. Zugehörige MAWB eingeben, um CMR oder Manifest zuzuordnen.",
        ),
      );
      return;
    }
    const m = match[0].replace(/[- ]/g, "");
    const mawb = m.slice(0, 3) + "-" + m.slice(3);
    const existing = rows.find((s) => s.mawb === mawb);
    scanner.current?.stop();
    if (existing) edit(existing);
    else {
      blank();
      setActiveShipment((s) => (s ? { ...s, mawb } : s));
    }
  }
  async function startScan() {
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      scanner.current =
        await new BrowserMultiFormatReader().decodeFromVideoDevice(
          undefined,
          video.current!,
          (result) => {
            if (result) findCode(result.getText());
          },
        );
    } catch {
      setNotice(
        t(
          "Camera unavailable. Use a USB scanner or enter the code.",
          "Kamera nicht verfügbar. USB-Scanner oder Eingabe nutzen.",
        ),
      );
    }
  }
  // Feedback is sent to a separate table, never mixed into shipment records.
  async function sendFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.get("message"),
          category: data.get("category"),
          page,
        }),
      });
      const d = (await r.json()) as ApiResponse;
      if (!r.ok) throw Error(d.error);
      setNotice(
        t(
          "Thank you. Your feedback was saved for the project owner.",
          "Danke. Dein Feedback wurde für die Projektleitung gespeichert.",
        ),
      );
      setModal(null);
    } catch (e) {
      setNotice(String(e));
    } finally {
      setBusy(false);
    }
  }
  const all = rows.length ? rows : samples;
  const shown = all.filter(
    (s) =>
      (filter === "all" || s.status === filter) &&
      (s.mawb + " " + s.route + " " + s.mrn)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const nav = [
    ["overview", LayoutDashboard, t("Overview", "Übersicht")],
    ["shipments", Package, t("Shipments", "Sendungen")],
    ["checklist", ClipboardCheck, t("Checklist", "Checkliste")],
    ["lab", FlaskConical, t("Automation lab", "Automatisierung")],
    ["guide", BookOpen, t("Learning library", "Lernbibliothek")],
  ] as const;
  const checkLabels = de
    ? [
        "Identität und Dokumente abgeglichen",
        "Packstücke und Gewicht verglichen",
        "Zollnachweis und Verfahren geprüft",
        "Abweichungen geklärt und dokumentiert",
        "Verantwortliche Person hat geprüft",
      ]
    : [
        "Match shipment identity and documents",
        "Compare piece count and gross weight",
        "Review customs evidence and procedure",
        "Resolve and record discrepancies",
        "Complete responsible human review",
      ];
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="/" aria-label="CargoClear home">
          <span className="brand-icon">
            <Package size={24} />
          </span>
          Cargo<span>Clear</span>
          <small>WORKSPACE</small>
        </a>
        <div className="workspace">
          <span className="avatar">GC</span>
          <div>
            {t("My cargo workspace", "Mein Cargo-Arbeitsplatz")}
            <small>
              {t("Personal workspace", "Persönlicher Arbeitsplatz")}
            </small>
          </div>
          <Settings2 size={15} />
        </div>
        <div className="nav-caption">{t("WORKSPACE", "ARBEITSPLATZ")}</div>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              className={page === id ? "selected" : ""}
              onClick={() => setPage(id)}
            >
              <Icon size={19} />
              {label}
              {id === "shipments" && (
                <span className="count">{all.length}</span>
              )}
              {id === "lab" && <small className="new">LAB</small>}
            </button>
          ))}
        </nav>
        <div className="aside-bottom">
          <div className="learning-card">
            <span className="tiny-icon">
              <FlaskConical size={18} />
            </span>
            <strong>
              {t(
                "Small steps. Real progress.",
                "Kleine Schritte. Echte Erfolge.",
              )}
            </strong>
            <p>
              {t(
                "Turn your daily checks into your next Python project.",
                "Mach deine täglichen Prüfungen zum nächsten Python-Projekt.",
              )}
            </p>
            <button onClick={() => setPage("lab")}>
              {t("Explore the lab", "Labor entdecken")}{" "}
              <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="source-link" onClick={() => setPage("source")}>
            <Code2 size={17} />
            {t("How it’s built", "So ist es gebaut")}
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <span className="avatar dark">G</span>
            <div>
              Grace
              <small>{t("Learning & building", "Lernen & Entwickeln")}</small>
            </div>
            <span className="online" />
          </div>
        </div>
      </aside>
      <main>
        <div className="public-banner">
          {t(
            "PUBLIC PRACTICE SITE · Fictional data only · Your workspace is separate in this browser. Clearing cookies loses access to it.",
            "ÖFFENTLICHE ÜBUNGSSEITE · Nur erfundene Daten · Separater Arbeitsbereich in diesem Browser. Ohne Cookies ist er nicht mehr zugänglich.",
          )}
        </div>
        <header>
          <div>
            {t("Workspace", "Arbeitsplatz")}
            <ChevronRight size={13} />
            <strong>
              {nav.find((n) => n[0] === page)?.[2] ||
                t("How it’s built", "So ist es gebaut")}
            </strong>
          </div>
          <div>
            <span className="private">
              <Globe size={14} />
              {t("Community preview", "Community-Vorschau")}
            </span>
            <button className="language" onClick={() => setGerman(!de)}>
              <Globe size={15} /> {de ? "DE" : "EN"} <span>⌄</span>
            </button>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {t(
                  "YOUR OPERATIONS, setActiveShipment LITTLE CLEARER",
                  "DEIN BETRIEB. EIN STÜCK KLARER.",
                )}
              </div>
              <h1>
                {page === "overview"
                  ? t(
                      "setActiveShipment clearer view of every shipment.",
                      "Jede Sendung im Blick.",
                    )
                  : nav.find((n) => n[0] === page)?.[2] ||
                    t("Built to be understood.", "Gebaut, um es zu verstehen.")}
              </h1>
              <p>
                {t(
                  "Capture documents. Catch discrepancies. Keep cargo moving.",
                  "Dokumente erfassen. Abweichungen erkennen. Den Überblick behalten.",
                )}
              </p>
            </div>
            <button className="primary" onClick={blank}>
              <Plus size={18} />
              {t("New shipment", "Neue Sendung")}
            </button>
          </div>
          {(page === "overview" || page === "shipments") && (
            <>
              <div className="stats">
                {[
                  [
                    Package,
                    t("Total shipments", "Sendungen gesamt"),
                    all.length,
                    t("Across your workspace", "In deinem Arbeitsplatz"),
                    "",
                  ],
                  [
                    AlertTriangle,
                    t("Needs attention", "Prüfung erforderlich"),
                    all.filter((s) => flags(s).length).length,
                    t(
                      "Missing or inconsistent details",
                      "Fehlende oder abweichende Angaben",
                    ),
                    "orange",
                  ],
                  [
                    Clock,
                    t("Awaiting review", "Prüfung ausstehend"),
                    all.filter((s) => s.status === "pending").length,
                    t("Ready for a closer look", "Bereit zur Durchsicht"),
                    "blue",
                  ],
                  [
                    ShieldCheck,
                    t("Review complete", "Prüfung abgeschlossen"),
                    all.filter((s) => s.status === "approved").length,
                    t("Recorded by a person", "Von einer Person erfasst"),
                    "green",
                  ],
                ].map(([Icon, label, n, sub, color]: any) => (
                  <div className="stat" key={label}>
                    <div>
                      {label}
                      <Icon size={18} className={color} />
                    </div>
                    <strong>{String(n).padStart(2, "0")}</strong>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
              {page === "overview" && (
                <div className="intro-grid">
                  <section className="intake card">
                    <div className="section-title">
                      <div className="icon-box">
                        <ScanLine size={21} />
                      </div>
                      <div>
                        <h2>
                          {t(
                            "Start with a document",
                            "Mit einem Dokument starten",
                          )}
                        </h2>
                        <p>
                          {t(
                            "One entry point for your next shipment.",
                            "Ein Einstieg für deine nächste Sendung.",
                          )}
                        </p>
                      </div>
                      <span className="tag">{t("CAPTURE", "ERFASSEN")}</span>
                    </div>
                    <button
                      className="dropzone"
                      onClick={() => {
                        blank();
                        setModal("upload");
                      }}
                    >
                      <span className="upload-icon">
                        <Upload size={23} />
                      </span>
                      <strong>
                        {t(
                          "Upload shipment documents",
                          "Sendungsdokumente hochladen",
                        )}
                      </strong>
                      <span>
                        {t(
                          "MAWB, CMR, manifest or transit document",
                          "MAWB, CMR, Manifest oder Versanddokument",
                        )}
                      </span>
                      <small>
                        PDF, JPG, PNG, TXT, JSON ·{" "}
                        {t("up to 15 MB", "bis 15 MB")}
                      </small>
                      <span className="outline-button">
                        {t("Choose a document", "Dokument auswählen")}{" "}
                        <ArrowUpRight size={14} />
                      </span>
                    </button>
                    <div className="intake-footer">
                      <span>
                        {t(
                          "Have a barcode or QR code?",
                          "Barcode oder QR-Code vorhanden?",
                        )}
                      </span>
                      <button onClick={() => setModal("scan")}>
                        <ScanLine size={16} />
                        {t("Scan a code", "Code scannen")}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </section>
                  <section className="journey">
                    <div className="eyebrow">
                      {t(
                        "FROM ARRIVAL TO CLARITY",
                        "VON DER ANKUNFT ZUM ÜBERBLICK",
                      )}
                    </div>
                    <h2>
                      {t(
                        "Your next workflow,\none check at a time.",
                        "Dein nächster Ablauf,\nSchritt für Schritt.",
                      )}
                    </h2>
                    <p>
                      {t(
                        "setActiveShipment practical place to do the work today—and learn to automate it tomorrow.",
                        "Heute praktisch arbeiten. Morgen lernen, den Ablauf zu automatisieren.",
                      )}
                    </p>
                    <div className="pipeline">
                      <span>
                        <Upload size={17} />
                      </span>
                      <i />
                      <span>
                        <FileText size={17} />
                      </span>
                      <i />
                      <span>
                        <ClipboardCheck size={17} />
                      </span>
                      <i />
                      <span>
                        <Check size={17} />
                      </span>
                    </div>
                    <div className="pipeline-labels">
                      <span>{t("Capture", "Erfassen")}</span>
                      <span>{t("Check", "Prüfen")}</span>
                      <span>{t("Review", "Bewerten")}</span>
                      <span>{t("Complete", "Abschluss")}</span>
                    </div>
                    <button onClick={() => setModal("motion")}>
                      {t("See how it works", "So funktioniert es")}
                      <ArrowUpRight size={16} />
                    </button>
                    <div className="journey-orbit" />
                  </section>
                </div>
              )}
              <section className="card shipment-card">
                <div className="table-heading">
                  <div>
                    <h2>
                      {t("Shipment watchlist", "Sendungsübersicht")}
                      <span className="pill">{all.length}</span>
                    </h2>
                    <p>
                      {t(
                        "The details that need you, all in one place.",
                        "Alle Angaben, die deine Aufmerksamkeit brauchen.",
                      )}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() =>
                      download(
                        "cargoclear-shipments.json",
                        JSON.stringify(all, null, 2),
                      )
                    }
                  >
                    <Download size={15} />
                    {t("Export", "Exportieren")}
                  </button>
                </div>
                <div className="table-tools">
                  <div className="tabs">
                    {[
                      ["all", t("All shipments", "Alle")],
                      ["review", t("Needs attention", "Prüfbedarf")],
                      ["pending", t("Awaiting review", "Ausstehend")],
                      ["approved", t("Complete", "Abgeschlossen")],
                    ].map(([id, label]) => (
                      <button
                        className={filter === id ? "active" : ""}
                        onClick={() => setFilter(id)}
                        key={id}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t(
                        "Search MAWB, MRN, route…",
                        "MAWB, MRN, Strecke suchen…",
                      )}
                    />
                  </label>
                </div>
                {!rows.length && (
                  <div className="sample-note">
                    {t(
                      "EXAMPLE DATA · Explore a shipment below, or create your first practice record.",
                      "BEISPIELDATEN · Öffne eine Sendung oder erstelle deinen ersten eigenen Übungsdatensatz.",
                    )}
                  </div>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {[
                          t("SHIPMENT / MAWB", "SENDUNG / MAWB"),
                          t("ROUTE", "STRECKE"),
                          t("CARGO", "FRACHT"),
                          t("REVIEW STATUS", "PRÜFSTATUS"),
                          t("REPORTED CUSTOMS STATUS", "GEMELDETER ZOLLSTATUS"),
                          t("CHECK RESULTS", "PRÜFERGEBNIS"),
                          "",
                        ].map((x, i) => (
                          <th key={i}>{x}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((s) => (
                        <tr key={s.id} onClick={() => edit(s)}>
                          <td>
                            <div className="shipment-id">
                              <span className="file-icon">
                                <FileText size={18} />
                              </span>
                              <div>
                                <strong>{s.mawb}</strong>
                                <small>
                                  {s.demo
                                    ? t("Practice shipment", "Übungssendung")
                                    : t(
                                        "Saved shipment",
                                        "Gespeicherte Sendung",
                                      )}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="route">
                              <Plane size={13} />
                              {s.route || "—"}
                            </span>
                          </td>
                          <td>
                            {s.pieces || "—"} {t("pcs", "Stk.")}
                            <small>{s.weight || "—"} kg</small>
                          </td>
                          <td>
                            <span className={"status " + s.status}>
                              <span />
                              {s.status === "approved"
                                ? t("Review complete", "Abgeschlossen")
                                : s.status === "review"
                                  ? t("Needs attention", "Prüfbedarf")
                                  : t("Awaiting review", "Ausstehend")}
                            </span>
                          </td>
                          <td>
                            {
                              (
                                {
                                  unknown: t(
                                    "Not established",
                                    "Nicht festgestellt",
                                  ),
                                  transit: t(
                                    "Transit reported",
                                    "Versand gemeldet",
                                  ),
                                  arrival: t(
                                    "Arrival reported",
                                    "Ankunft gemeldet",
                                  ),
                                  release: t(
                                    "Release reported",
                                    "Freigabe gemeldet",
                                  ),
                                  hold: t("Hold reported", "Sperre gemeldet"),
                                } as Record<string, string>
                              )[s.customsStatus || "unknown"]
                            }
                            <small>
                              {t("Source needs verification", "Quelle prüfen")}
                            </small>
                          </td>
                          <td>
                            {flags(s, de).length ? (
                              <span className="issue">
                                <AlertTriangle size={14} />
                                {flags(s, de)[0]}
                                {flags(s).length > 1 && (
                                  <b>+{flags(s).length - 1}</b>
                                )}
                              </span>
                            ) : (
                              <span className="passed">
                                <Check size={14} />
                                {t("No data mismatch", "Keine Datenabweichung")}
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              aria-label={t("Open shipment", "Sendung öffnen")}
                              className="row-open"
                              onClick={(e) => {
                                e.stopPropagation();
                                edit(s);
                              }}
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!shown.length && (
                    <div className="empty">
                      {t(
                        "No shipments match this search.",
                        "Keine passenden Sendungen.",
                      )}
                    </div>
                  )}
                </div>
                <div className="table-bottom">
                  {shown.length} {t("shipments shown", "Sendungen angezeigt")}
                  <span>
                    <span className="dot" />
                    {t(
                      "Your checks support a human decision",
                      "Deine Prüfungen unterstützen die menschliche Entscheidung",
                    )}
                  </span>
                </div>
              </section>
              {page === "overview" && (
                <div className="bottom-grid">
                  <section className="card next-project">
                    <span className="icon-box">
                      <Code2 size={21} />
                    </span>
                    <div>
                      <div className="eyebrow">
                        {t(
                          "BUILD YOUR FIRST AUTOMATION",
                          "DEINE ERSTE AUTOMATISIERUNG",
                        )}
                      </div>
                      <h3>
                        {t(
                          "setActiveShipment missing-information checker",
                          "Ein Prüfer für fehlende Angaben",
                        )}
                      </h3>
                      <p>
                        {t(
                          "Learn how a few lines of Python can flag an empty MRN.",
                          "Lerne, wie wenige Zeilen Python eine fehlende MRN erkennen.",
                        )}
                      </p>
                    </div>
                    <button onClick={() => setPage("lab")}>
                      <ArrowRight size={21} />
                    </button>
                  </section>
                  <section className="card tip">
                    <BookOpen size={20} />
                    <div>
                      <h3>{t("What does MRN mean?", "Was bedeutet MRN?")}</h3>
                      <p>
                        {t(
                          "setActiveShipment reference assigned by customs to identify a declaration.",
                          "Eine vom Zoll vergebene Referenz zur Identifikation einer Anmeldung.",
                        )}
                      </p>
                      <button onClick={() => setPage("guide")}>
                        {t(
                          "Open the learning library",
                          "Lernbibliothek öffnen",
                        )}
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
          {page === "checklist" && (
            <section className="card roomy">
              <span className="tag">
                {t("REUSABLE TEMPLATE", "WIEDERVERWENDBARE VORLAGE")}
              </span>
              <h2>
                {t(
                  "setActiveShipment repeatable review, every arrival.",
                  "Jede Ankunft strukturiert prüfen.",
                )}
              </h2>
              <p>
                {t(
                  "Open a shipment to save its own checklist. Adapt this starting template to your company’s approved procedure.",
                  "Öffne eine Sendung, um ihre Checkliste zu speichern. Passe diese Vorlage an die freigegebenen betrieblichen Verfahren an.",
                )}
              </p>
              {checkLabels.map((x, i) => (
                <div className="check-template" key={x}>
                  <span>0{i + 1}</span>
                  <div>
                    <strong>{x}</strong>
                    <p>
                      {
                        [
                          t(
                            "Match MAWB and route to the documents actually received.",
                            "MAWB und Strecke mit den vorliegenden Dokumenten abgleichen.",
                          ),
                          t(
                            "Compare the MAWB with the manifest and record any difference.",
                            "MAWB und Manifest vergleichen; Abweichungen erfassen.",
                          ),
                          t(
                            "Record the procedure and reference. Check evidence through the authorised process.",
                            "Verfahren und Referenz erfassen. Nachweise im autorisierten Prozess prüfen.",
                          ),
                          t(
                            "Keep the explanation and the supporting documents together.",
                            "Begründung und Nachweise zusammen ablegen.",
                          ),
                          t(
                            "Record who reviewed it, when, and on what evidence.",
                            "Person, Zeitpunkt und Prüfgrundlage dokumentieren.",
                          ),
                        ][i]
                      }
                    </p>
                  </div>
                  <ClipboardCheck size={20} />
                </div>
              ))}
              <button
                className="primary"
                onClick={() =>
                  download(
                    "arrival-checklist.txt",
                    checkLabels.map((x, i) => `${i + 1}. [ ] ${x}`).join("\n"),
                    "text/plain",
                  )
                }
              >
                <Download size={17} />
                {t("Download checklist", "Checkliste herunterladen")}
              </button>
            </section>
          )}
          {page === "lab" && (
            <>
              <section className="lab-banner">
                <FlaskConical size={28} />
                <h2>
                  {t(
                    "Learn by doing the work you know.",
                    "Lerne mit der Arbeit, die du kennst.",
                  )}
                </h2>
                <p>
                  {t(
                    "One small project. One useful result. Start with the missing-MRN checker.",
                    "Ein kleines Projekt. Ein nützliches Ergebnis. Starte mit dem MRN-Prüfer.",
                  )}
                </p>
                <div className="mini-steps">
                  Python → {t("Document tools", "Dokument-Tools")} →{" "}
                  {t("AI assistance", "KI-Unterstützung")} →{" "}
                  {t("Coordinated agents", "Koordinierte Agenten")}
                </div>
              </section>
              <div className="lab-grid">
                <section className="card roomy">
                  <span className="tag">01 · PYTHON</span>
                  <h2>
                    {t(
                      "Spot a missing reference",
                      "Eine fehlende Referenz erkennen",
                    )}
                  </h2>
                  <p>
                    {t(
                      "setActiveShipment variable is a named box for a value. Here, mrn is an empty box. An if statement asks a yes/no question: is this box empty?",
                      "Eine Variable ist eine benannte Box für einen Wert. Hier ist mrn leer. Eine if-Anweisung stellt eine Ja/Nein-Frage: Ist diese Box leer?",
                    )}
                  </p>
                  <pre>
                    {
                      'mrn = ""\n\nif not mrn.strip():\n    print("Missing MRN — review needed")\nelse:\n    print("Reference present — verify evidence")'
                    }
                  </pre>
                  <button
                    className="primary"
                    onClick={() => setLesson(lesson + 1)}
                  >
                    {t("Try the next value", "Nächsten Wert testen")}{" "}
                    <ArrowRight size={16} />
                  </button>
                  <div className="code-result">
                    mrn = {lesson % 2 ? '"26DE12345678901234"' : '""'}
                    <br />→{" "}
                    {lesson % 2
                      ? t(
                          "Reference present — verify evidence",
                          "Referenz vorhanden — Nachweis prüfen",
                        )
                      : t(
                          "Missing MRN — review needed",
                          "MRN fehlt — Prüfung erforderlich",
                        )}
                  </div>
                  <p className="muted">
                    {t(
                      "Interactive illustration of the code. Run the Python file from the source package on your computer for real Python practice.",
                      "Interaktive Darstellung des Codes. Für echte Python-Übung starte die Python-Datei aus dem Quellcode-Paket auf deinem Computer.",
                    )}
                  </p>
                </section>
                <section className="card roomy">
                  <span className="tag">
                    {t("PRACTICE SCENARIOS", "ÜBUNGSSZENARIEN")}
                  </span>
                  <h2>
                    {t(
                      "Can you find the discrepancy?",
                      "Findest du die Abweichung?",
                    )}
                  </h2>
                  <p>
                    MAWB: 24 {t("pieces", "Packstücke")} · Manifest: 22
                    <br />
                    MRN: — · {t("Procedure", "Verfahren")}: T1
                  </p>
                  <button
                    className="outline-button"
                    onClick={() => setExplanationVisible(!reveal)}
                  >
                    {reveal
                      ? t("Hide explanation", "Erklärung ausblenden")
                      : t("Reveal explanation", "Erklärung anzeigen")}
                  </button>
                  {reveal && (
                    <p className="explanation">
                      {t(
                        "Two issues: the piece counts differ and the MRN is missing. Ask for clarification and record the evidence before completing the review. setActiveShipment matching count alone would not prove customs release.",
                        "Zwei Probleme: Die Packstückzahlen weichen ab und die MRN fehlt. Klärung einholen und Nachweise dokumentieren. Gleiche Mengen allein beweisen keine Zollfreigabe.",
                      )}
                    </p>
                  )}
                  <button
                    className="text-button"
                    onClick={() => {
                      setShipments((old) => [
                        ...old.filter((s) => !s.demo),
                        ...samples,
                      ]);
                      setPage("shipments");
                    }}
                  >
                    {t("Load 3 practice shipments", "3 Übungssendungen laden")}
                    <ArrowUpRight size={15} />
                  </button>
                  <a
                    className="text-button"
                    href="/practice-shipment.json"
                    download
                  >
                    {t(
                      "Download a practice JSON file",
                      "JSON-Übungsdatei herunterladen",
                    )}{" "}
                    <Download size={15} />
                  </a>
                  <hr />
                  <h3>{t("Your next modules", "Deine nächsten Module")}</h3>
                  <p>
                    {t(
                      "2. Compare manifest quantities\n3. Read document text (OCR)\n4. Suggest discrepancies with AI\n5. Coordinate tested tools with a supervisor",
                      "2. Manifestmengen vergleichen\n3. Dokumenttext lesen (OCR)\n4. KI schlägt Abweichungen vor\n5. Getestete Tools koordinieren",
                    )}
                  </p>
                  <small>
                    {t(
                      "Future modules · not connected to live customs systems",
                      "Zukünftige Module · keine Verbindung zu Live-Zollsystemen",
                    )}
                  </small>
                </section>
              </div>
            </>
          )}
          {page === "guide" && (
            <section className="card roomy">
              <span className="tag">
                {t("PLAIN-LANGUAGE LIBRARY", "EINFACH ERKLÄRT")}
              </span>
              <h2>
                {t(
                  "setActiveShipment little context goes a long way.",
                  "Ein wenig Kontext hilft viel.",
                )}
              </h2>
              {[
                [
                  "MAWB",
                  t(
                    "Master Air Waybill: the main air cargo transport document. Use its reference to connect shipment records.",
                    "Master Air Waybill: der Hauptluftfrachtbrief. Seine Nummer verbindet die Sendungsdaten.",
                  ),
                ],
                [
                  "CMR",
                  t(
                    "The road consignment note used for the truck leg of the journey.",
                    "Der Frachtbrief für den Straßentransport.",
                  ),
                ],
                [
                  "MRN / NCTS",
                  t(
                    "NCTS is the electronic transit system. An MRN identifies a customs declaration; its presence alone does not prove release or discharge.",
                    "NCTS ist das elektronische Versandsystem. Die MRN identifiziert eine Zollanmeldung; ihr Vorhandensein beweist allein keine Freigabe oder Erledigung.",
                  ),
                ],
                [
                  "OCR",
                  t(
                    "Optical character recognition turns text in a scan into text a computer can read. This version stores scans; automatic text extraction is a future module.",
                    "Texterkennung wandelt einen Scan in computerlesbaren Text um. Diese Version speichert Scans; automatische Erkennung ist ein zukünftiges Modul.",
                  ),
                ],
                [
                  "API",
                  t(
                    "setActiveShipment defined doorway through which one program can ask another program for information or an action.",
                    "Eine festgelegte Schnittstelle, über die Programme Informationen oder Aktionen anfragen.",
                  ),
                ],
                [
                  "AI agent",
                  t(
                    "setActiveShipment program that uses AI to choose and use tools for a task. Start with reliable small tools and keep human approval for operational decisions.",
                    "Ein Programm, das mit KI Werkzeuge für eine Aufgabe auswählt. Beginne mit zuverlässigen kleinen Tools und menschlicher Prüfung.",
                  ),
                ],
              ].map(([title, body]) => (
                <div className="glossary" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
              <a
                className="text-button"
                href="https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/new-computerised-transit-system-ncts_en"
                target="_blank"
                rel="noreferrer"
              >
                {t(
                  "European Commission · NCTS reference",
                  "Europäische Kommission · NCTS-Referenz",
                )}{" "}
                ↗
              </a>
              <hr />
              <p>
                {t(
                  "Motion graphics use Remotion. Voice preference: Ryan, English male. No voiceover is generated in this version; a future recording should use your chosen Ryan voice provider and voice ID consistently.",
                  "Die Animation nutzt Remotion. Stimmpräferenz: Ryan, Englisch, männlich. Diese Version enthält keine Sprachaufnahme; künftige Aufnahmen sollen denselben Ryan-Anbieter und dieselbe Stimm-ID nutzen.",
                )}
              </p>
            </section>
          )}
          {page === "source" && (
            <section className="card roomy">
              <span className="tag">OPEN TO LEARNING</span>
              <h2>
                {t(
                  "Understand every moving part.",
                  "Jeden Baustein verstehen.",
                )}
              </h2>
              <p>
                {t(
                  "CargoClear is made of small parts you can read, test and improve independently. The source package includes a beginner guide, README, fictional examples and a Python starter exercise.",
                  "CargoClear besteht aus kleinen Teilen, die du einzeln lesen, testen und verbessern kannst. Das Quellcode-Paket enthält eine Anleitung, README, erfundene Beispiele und eine Python-Übung.",
                )}
              </p>
              <div className="architecture">
                {[
                  "Document / code",
                  "React interface",
                  "Comparison rules",
                  "Database + files",
                  "Human review",
                ].map((s, i) => (
                  <span key={s}>
                    {i + 1}. {s}
                  </span>
                ))}
              </div>
              <a
                className="text-button"
                href="/signin-with-chatgpt?return_to=/"
              >
                {t("Owner sign in", "Anmeldung Projektleitung")} ↗
              </a>
              <br />
              <button
                className="text-button"
                onClick={async () => {
                  const r = await fetch("/api/feedback");
                  if (!r.ok) {
                    setNotice(
                      t(
                        "Feedback inbox is available to the signed-in project owner.",
                        "Feedback-Postfach nur für die angemeldete Projektleitung.",
                      ),
                    );
                    return;
                  }
                  setFeedbackItems(((await r.json()) as ApiResponse).feedback);
                }}
              >
                {t(
                  "Owner: open feedback inbox",
                  "Projektleitung: Feedback öffnen",
                )}
              </button>
              {feedbackItems.map((f, i) => (
                <div className="feedback-list" key={i}>
                  <strong>
                    {f.category} · {f.page}
                  </strong>
                  <p>{f.message}</p>
                  <small>{f.date}</small>
                </div>
              ))}
              <div className="glossary">
                <h3>app/page.tsx</h3>
                <p>
                  {t(
                    "The screens, buttons and field comparisons. React updates the screen when data changes.",
                    "Ansichten, Schaltflächen und Vergleiche. React aktualisiert die Ansicht bei Datenänderungen.",
                  )}
                </p>
              </div>
              <div className="glossary">
                <h3>app/api/ · db/</h3>
                <p>
                  {t(
                    "The server saves shipment records in a database and documents in file storage. Saved records can be reloaded across visits.",
                    "Der Server speichert Sendungsdaten in einer Datenbank und Dokumente im Dateispeicher. Daten werden bei späteren Besuchen geladen.",
                  )}
                </p>
              </div>
              <div className="glossary">
                <h3>app/motion.tsx</h3>
                <p>
                  {t(
                    "Remotion draws each animation frame. The animation explains the workflow without needing audio.",
                    "Remotion zeichnet die einzelnen Animationsbilder. Der Ablauf wird ohne Ton erklärt.",
                  )}
                </p>
              </div>
              <div className="actions">
                <a
                  className="outline-button"
                  href="/source/comparison-rules.txt"
                  target="_blank"
                >
                  {t("Read the comparison rules", "Vergleichsregeln lesen")} ↗
                </a>
                <a
                  className="outline-button"
                  href="/source/learning-guide.txt"
                  target="_blank"
                >
                  {t("Read the beginner guide", "Anleitung lesen")} ↗
                </a>
              </div>
              <a className="primary" href="/cargoclear-source.zip" download>
                <Download size={17} />
                {t(
                  "Download readable source code",
                  "Lesbaren Quellcode herunterladen",
                )}
              </a>
              <p>
                {t(
                  "GitHub-ready, with fictional samples only. Review the sharing guide before adding your own documents.",
                  "Bereit für GitHub, nur mit erfundenen Beispielen. Lies den Leitfaden, bevor du eigene Dokumente ergänzt.",
                )}
              </p>
            </section>
          )}
          <footer>
            <span>
              CargoClear <span>·</span>{" "}
              {t(
                "Built for the work. Designed for the learning.",
                "Für die Arbeit gebaut. Zum Lernen gestaltet.",
              )}
            </span>
            <span>
              {t(
                "Document review assistant · no live customs connection",
                "Dokumenten-Prüfhilfe · keine Live-Zollverbindung",
              )}
            </span>
          </footer>
        </div>
      </main>
      <button className="feedback-button" onClick={() => setModal("feedback")}>
        {t("Share feedback ↗", "Feedback geben ↗")}
      </button>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="overlay"
          onClick={() => {
            scanner.current?.stop();
            setModal(null);
          }}
        >
          <section
            className={"modal " + (modal === "motion" ? "motion-modal" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => {
                scanner.current?.stop();
                setModal(null);
              }}
            >
              <X size={22} />
            </button>
            {modal === "feedback" ? (
              <>
                <span className="tag">CARGOCLEAR · COMMUNITY</span>
                <h2>
                  {t(
                    "Help shape the next version.",
                    "Gestalte die nächste Version mit.",
                  )}
                </h2>
                <p>
                  {t(
                    "What worked? What was confusing? Which repetitive task should we tackle next? Please leave out customer, shipment and personal details. Your feedback is visible to the project owner.",
                    "Was funktioniert? Was ist unklar? Welche Routineaufgabe sollen wir als Nächstes angehen? Bitte keine Kunden-, Sendungs- oder persönlichen Daten angeben. Dein Feedback ist für die Projektleitung sichtbar.",
                  )}
                </p>
                <form onSubmit={sendFeedback}>
                  <label>
                    {t("Feedback type", "Feedback-Art")}
                    <select name="category">
                      <option value="idea">
                        {t("Improvement idea", "Verbesserungsidee")}
                      </option>
                      <option value="bug">
                        {t(
                          "Something did not work",
                          "Etwas funktioniert nicht",
                        )}
                      </option>
                      <option value="automation">
                        {t(
                          "setActiveShipment task to automate",
                          "Eine Aufgabe automatisieren",
                        )}
                      </option>
                      <option value="learning">
                        {t("Learning experience", "Lernerfahrung")}
                      </option>
                    </select>
                  </label>
                  <label>
                    {t("Your feedback", "Dein Feedback")}
                    <textarea
                      name="message"
                      minLength={10}
                      maxLength={3000}
                      required
                      placeholder={t(
                        "I tried… I expected… It would help if…",
                        "Ich habe versucht… Ich erwartete… Hilfreich wäre…",
                      )}
                    />
                  </label>
                  <small>
                    {t(
                      "Current page is included automatically.",
                      "Die aktuelle Seite wird automatisch mitgesendet.",
                    )}
                  </small>
                  <div className="actions">
                    <button className="primary" disabled={busy}>
                      {t("Send feedback", "Feedback senden")}
                    </button>
                  </div>
                </form>
              </>
            ) : modal === "motion" ? (
              <Player
                component={Workflow}
                inputProps={{ de }}
                durationInFrames={240}
                compositionWidth={760}
                compositionHeight={330}
                fps={30}
                controls
                autoPlay
                style={{ width: "100%" }}
              />
            ) : modal === "scan" ? (
              <>
                <h2>
                  {t("Scan a shipment reference", "Sendungsreferenz scannen")}
                </h2>
                <p>
                  {t(
                    "Scan a MAWB barcode or a QR code containing the MAWB. setActiveShipment USB scanner can type into the field below.",
                    "MAWB-, CMR- oder Manifest-Code scannen. Eine MAWB öffnet die Sendung; andere Referenzen werden zur manuellen Zuordnung erfasst. USB-Scanner können unten eingeben.",
                  )}
                </p>
                <video ref={video} className="camera" playsInline muted />
                <button className="primary" onClick={startScan}>
                  {t("Start camera", "Kamera starten")}
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    findCode(
                      new FormData(e.currentTarget).get("code") as string,
                    );
                  }}
                >
                  <label>
                    {t("Code or MAWB", "Code oder MAWB")}
                    <input name="code" placeholder="020-12345675" required />
                  </label>
                  <button className="outline-button">
                    {t("Find / create shipment", "Sendung finden / anlegen")}
                  </button>
                </form>
              </>
            ) : (
              active && (
                <>
                  <span className="tag">
                    {active.demo
                      ? t(
                          "PRACTICE · NOT SAVED TO SERVER",
                          "ÜBUNG · NICHT AUF DEM SERVER GESPEICHERT",
                        )
                      : t("SHIPMENT RECORD", "SENDUNGSDATENSATZ")}
                  </span>
                  <h2>
                    {modal === "detail"
                      ? active.mawb
                      : t("Capture a shipment", "Sendung erfassen")}
                  </h2>
                  <p>
                    {t(
                      "Attach the source, enter its details, then compare and review. JSON can fill fields; PDF and image text is entered manually in this version.",
                      "Quelle anhängen, Angaben erfassen, dann vergleichen und prüfen. JSON kann Felder ausfüllen; PDF- und Bildtext wird manuell eingegeben.",
                    )}
                  </p>
                  <label className="attach">
                    <Upload size={18} />
                    {t("Attach document", "Dokument anhängen")}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.json"
                      disabled={busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(f);
                      }}
                    />
                  </label>
                  {active.documents.map((doc) => (
                    <a
                      key={doc.key}
                      className="document-link"
                      href={"/api/documents?key=" + doc.key}
                    >
                      {doc.name} ↗
                    </a>
                  ))}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const s = {
                        ...active,
                        status: flags(active).length
                          ? "review"
                          : active.status === "approved"
                            ? "approved"
                            : "pending",
                        history: [
                          ...active.history,
                          new Date().toISOString() +
                            " · " +
                            t("Details saved", "Angaben gespeichert"),
                        ],
                      };
                      if (await save(s)) setModal("detail");
                    }}
                  >
                    <div className="form-grid">
                      {[
                        ["mawb", "MAWB", "020-12345675"],
                        ["route", t("Route", "Strecke"), "FRA → JFK"],
                        ["pieces", t("MAWB pieces", "MAWB Packstücke"), "24"],
                        [
                          "manifestPieces",
                          t("Manifest pieces", "Manifest Packstücke"),
                          "24",
                        ],
                        [
                          "weight",
                          t("MAWB weight (kg)", "MAWB Gewicht (kg)"),
                          "1240",
                        ],
                        [
                          "manifestWeight",
                          t("Manifest weight (kg)", "Manifest Gewicht (kg)"),
                          "1240",
                        ],
                        ["mrn", "MRN", "26DE…"],
                        ["procedure", t("Procedure", "Verfahren"), "T1"],
                      ].map(([key, label, ph]) => (
                        <label key={key}>
                          {label}
                          <input
                            required={key === "mawb"}
                            pattern={
                              key === "mawb" ? "[0-9]{3}-[0-9]{8}" : undefined
                            }
                            type={
                              [
                                "pieces",
                                "weight",
                                "manifestPieces",
                                "manifestWeight",
                              ].includes(key)
                                ? "number"
                                : "text"
                            }
                            min="0"
                            step={
                              key.toLowerCase().includes("weight")
                                ? "0.01"
                                : "1"
                            }
                            value={String((active as any)[key])}
                            placeholder={ph}
                            onChange={(e) =>
                              setActiveShipment({
                                ...active,
                                [key]: e.target.value,
                                status: "pending",
                                checks: [false, false, false, false, false],
                              })
                            }
                          />
                        </label>
                      ))}
                      <label>
                        {t("Reported customs status", "Gemeldeter Zollstatus")}
                        <select
                          value={active.customsStatus || "unknown"}
                          onChange={(e) =>
                            setActiveShipment({
                              ...active,
                              customsStatus: e.target.value,
                              status: "pending",
                              checks: [false, false, false, false, false],
                            })
                          }
                        >
                          {[
                            [
                              "unknown",
                              t("Not established", "Nicht festgestellt"),
                            ],
                            [
                              "transit",
                              t("Transit reported", "Versand gemeldet"),
                            ],
                            [
                              "arrival",
                              t("Arrival reported", "Ankunft gemeldet"),
                            ],
                            [
                              "release",
                              t("Release reported", "Freigabe gemeldet"),
                            ],
                            ["hold", t("Hold reported", "Sperre gemeldet")],
                          ].map(([v, l]) => (
                            <option value={v} key={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {t(
                          "Source / evidence reference",
                          "Quelle / Nachweisreferenz",
                        )}
                        <input
                          value={active.evidence || ""}
                          placeholder={t(
                            "Document, message reference and date",
                            "Dokument, Nachrichtenreferenz und Datum",
                          )}
                          onChange={(e) =>
                            setActiveShipment({
                              ...active,
                              evidence: e.target.value,
                              status: "pending",
                              checks: [false, false, false, false, false],
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="findings">
                      <h3>{t("Data checks", "Datenprüfungen")}</h3>
                      {flags(active, de).length ? (
                        flags(active, de).map((x) => (
                          <p key={x}>
                            <AlertTriangle size={15} />
                            {x}
                          </p>
                        ))
                      ) : (
                        <p className="passed">
                          <Check size={15} />
                          {t(
                            "No mismatch in the entered fields. Verify the source evidence.",
                            "Keine Abweichung in den Eingaben. Originalnachweise prüfen.",
                          )}
                        </p>
                      )}
                    </div>
                    <h3>{t("Arrival checklist", "Ankunftscheckliste")}</h3>
                    {checkLabels.map((x, i) => (
                      <label className="check-row" key={x}>
                        <input
                          type="checkbox"
                          checked={active.checks[i]}
                          onChange={(e) =>
                            setActiveShipment({
                              ...active,
                              checks: active.checks.map((v, j) =>
                                j === i ? e.target.checked : v,
                              ),
                              status: "pending",
                            })
                          }
                        />
                        {x}
                      </label>
                    ))}
                    <div className="actions">
                      <button className="primary" disabled={busy}>
                        {busy
                          ? t("Saving…", "Speichern…")
                          : t("Save & check", "Speichern & prüfen")}
                      </button>
                      <button
                        type="button"
                        className="outline-button"
                        disabled={
                          busy ||
                          flags(active).length > 0 ||
                          !active.checks.every(Boolean) ||
                          !active.documents.length
                        }
                        onClick={async () => {
                          const reviewer = prompt(
                            t(
                              "Reviewer name and evidence reference:",
                              "Name der prüfenden Person und Nachweisreferenz:",
                            ),
                          );
                          if (!reviewer?.trim()) return;
                          await save({
                            ...active,
                            status: "approved",
                            history: [
                              ...active.history,
                              new Date().toISOString() +
                                " · Human review: " +
                                reviewer,
                            ],
                          });
                        }}
                      >
                        {t("Complete human review", "Prüfung abschließen")}
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          download(
                            active.mawb + "-report.json",
                            JSON.stringify(
                              { ...active, findings: flags(active, de) },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Download size={15} />
                        {t("Report", "Bericht")}
                      </button>
                    </div>
                    <small>
                      {t(
                        "Completion requires all checks, no field discrepancies, an attached document and a named reviewer. This records your review, not customs release.",
                        "Abschluss erfordert alle Prüfpunkte, keine Datenabweichung, ein Dokument und eine benannte Prüfperson. Erfasst die Prüfung, keine Zollfreigabe.",
                      )}
                    </small>
                  </form>
                  <details>
                    <summary>
                      {t("Review history", "Prüfverlauf")} (
                      {active.history.length})
                    </summary>
                    {active.history.map((h, i) => (
                      <p key={i}>{h}</p>
                    ))}
                  </details>
                </>
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
