import { requireOwner } from "@/lib/admin";

const FILES = [
  { kind: "stories", title: "All stories", desc: "Every story with status, person, place, contributor and consent choices (no story text)." },
  { kind: "book", title: "Book-ready stories", desc: "Published stories whose subject agreed to appear in the coffee table book, with full text." },
  { kind: "contributors", title: "Contributors", desc: "One row per contributor with contact info and story counts." },
  { kind: "signups", title: "Contributor sign-ups", desc: "Everyone who signed up on the Get Involved page." },
  { kind: "withdrawals", title: "Withdrawal requests", desc: "Requests to change or remove a story, and how they were handled." },
  { kind: "activity", title: "Activity log", desc: "The full history of what's happened on the site." },
];

export default async function Exports() {
  await requireOwner();
  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Downloads</h1>
          <p>Spreadsheets (.csv) that open in Excel, Numbers, or Google Sheets. These contain private information, so keep them safe.</p>
        </div>
      </div>
      <div className="cards-3">
        {FILES.map((f) => (
          <div className="card" key={f.kind}>
            <h3>{f.title}</h3>
            <p className="muted" style={{ marginTop: -6 }}>{f.desc}</p>
            <a className="btn btn-outline btn-small" href={`/admin/export/${f.kind}`}>Download .csv</a>
          </div>
        ))}
      </div>
    </>
  );
}
