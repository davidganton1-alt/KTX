"use client";

import { useState } from "react";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export default function SupportPage() {
  const [sent, setSent] = useState(false);
  return (
    <Reveal as="main" variant="blur" className="container-page py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center">
          <SectionIcon name="help" size={56} />
        </div>
        <p className="eyebrow">Support</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">
          We are <span className="gradient-text">here to help</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Questions about your account, a withdrawal or how the AI works? Send us a
          note and a real person will reply. No bots, no runaround.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-semibold">Email</p>
          <p className="mt-1 text-sm text-[var(--muted)]">help@kingdomtradex.com</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold">Hours</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Mon to Fri, 9am to 6pm</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold">Response</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Within one business day</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="card mx-auto mt-10 max-w-3xl flex flex-col gap-4 p-6"
      >
        <h2 className="text-lg font-semibold">Send a message</h2>
        <input required placeholder="Your email" className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
        <input required placeholder="Subject" className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
        <textarea required rows={5} placeholder="How can we help?" className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]" />
        <button className="btn-primary self-start">
          {sent ? "Thank you, we received it" : "Send message"}
        </button>
      </form>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-[var(--muted)]">
        Looking for the rules? Read our{" "}
        <a href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</a> and{" "}
        <a href="/terms" className="text-[var(--gold)] hover:underline">Terms of Service</a>.
      </p>
      </Reveal>
  );
}
