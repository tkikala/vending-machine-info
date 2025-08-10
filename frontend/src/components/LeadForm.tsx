import React, { useState } from 'react';
import { submitLead } from '../api';

export default function LeadForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', venueName: '', address: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitLead({ name: form.name, email: form.email, phone: form.phone, venueName: form.venueName, address: form.address, message: form.message });
      setDone(true);
    } catch (e: any) {
      alert(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <div style={{ padding: 16 }}><h3>Thanks! We’ll reach out shortly.</h3></div>;

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
      <h2>Request a vending machine</h2>
      <input placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Venue name" required value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} />
      <input placeholder="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <textarea placeholder="Message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit request'}</button>
    </form>
  );
}
