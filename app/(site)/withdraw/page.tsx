import type { Metadata } from "next";
import WithdrawForm from "./WithdrawForm";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Change or remove a story" };

export default function Withdraw() {
  return (
    <>
      <div className="page-head"><div className="wrap"><h1>Change or remove a story</h1><p>Consent can be withdrawn at any time, no questions asked.</p></div></div>
      <section>
        <div className="narrow">
          <div className="form-card"><WithdrawForm /></div>
          <p className="muted">You can also email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
        </div>
      </section>
    </>
  );
}
