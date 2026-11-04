import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Only public client credentials are used. This checks the real API and its RLS.
const env = Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => { const index = line.indexOf('='); return [line.slice(0,index),line.slice(index+1)]; }));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const ids = [];
let a;
async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${url}${path}`, { method, headers: { apikey: key, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json', Prefer: 'return=representation' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const text = await response.text();
  return { ok: response.ok, status: response.status, data: text ? JSON.parse(text) : null };
}
async function guest() {
  const r = await request('/auth/v1/signup', null, 'POST', {});
  assert.ok(r.ok, `Anonymous sign-in failed: ${r.data?.msg || r.data?.message || r.status}`);
  assert.ok(r.data.access_token, 'No guest session returned');
  return { token: r.data.access_token, id: r.data.user.id };
}
try {
  a = await guest(); const b = await guest();
  console.log('PASS: two independent anonymous sessions');
  const taskId = crypto.randomUUID(); ids.push(taskId);
  const created = await request('/rest/v1/tasks', a.token, 'POST', { id: taskId, title: 'Integration test - delete me', user_id: a.id, status: 'todo' });
  assert.ok(created.ok, `Create failed: ${created.data?.message || created.status}`);
  const persisted = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token);
  assert.equal(persisted.data[0].title, 'Integration test - delete me');
  console.log('PASS: create and read persisted task');
  const updated = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token, 'PATCH', { status: 'in_progress' });
  assert.equal(updated.data[0].status, 'in_progress');
  console.log('PASS: update task status');
  const hidden = await request(`/rest/v1/tasks?id=eq.${taskId}`, b.token);
  assert.deepEqual(hidden.data, []);
  const unauthorizedUpdate = await request(`/rest/v1/tasks?id=eq.${taskId}`, b.token, 'PATCH', { title: 'intrusion' });
  assert.deepEqual(unauthorizedUpdate.data, []);
  const unauthorizedDelete = await request(`/rest/v1/tasks?id=eq.${taskId}`, b.token, 'DELETE');
  assert.deepEqual(unauthorizedDelete.data, []);
  console.log('PASS: another guest cannot read, modify, or delete the task');
  const transfer = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token, 'PATCH', { user_id: b.id });
  assert.equal(transfer.ok, false);
  const spoof = await request('/rest/v1/tasks', b.token, 'POST', { title: 'spoof', user_id: a.id });
  assert.equal(spoof.ok, false);
  console.log('PASS: ownership transfer and spoofed insert rejected');
  for (const patch of [{ status: 'invalid' }, { title: '   ' }, { priority: 'urgent' }]) {
    const invalid = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token, 'PATCH', patch);
    assert.equal(invalid.ok, false);
  }
  console.log('PASS: invalid status, title, and priority rejected');
  const unauthenticated = await request(`/rest/v1/tasks?id=eq.${taskId}`, null);
  assert.ok(!unauthenticated.ok || Array.isArray(unauthenticated.data) && unauthenticated.data.length === 0);
  console.log('PASS: unauthenticated access blocked');
  const deleted = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token, 'DELETE');
  assert.equal(deleted.data[0].id, taskId);
  const remaining = await request(`/rest/v1/tasks?id=eq.${taskId}`, a.token);
  assert.deepEqual(remaining.data, []);
  console.log('PASS: owner deletion persisted');
  console.log('All Supabase integration checks passed.');
} catch (error) { console.error('FAIL:', error.message); process.exitCode = 1; }
finally { if (a) for (const id of ids) await request(`/rest/v1/tasks?id=eq.${id}`, a.token, 'DELETE'); }
