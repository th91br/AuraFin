import assert from 'node:assert/strict';
import { createScopedRequestGuard } from '../../src/lib/scopedRequestGuard.ts';

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
};

function deferred<T>(): Deferred<T> {
  let resolvePromise!: (value: T) => void;
  const promise = new Promise<T>(resolve => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

const organizationA = deferred<string>();
const organizationB = deferred<string>();
const guardA = createScopedRequestGuard('organization-a');
const guardB = createScopedRequestGuard('organization-b');
const accepted: string[] = [];

const requestA = organizationA.promise.then(value => {
  if (guardA.isActive('organization-a')) accepted.push(value);
});

guardA.cancel();

const requestB = organizationB.promise.then(value => {
  if (guardB.isActive('organization-b')) accepted.push(value);
});

organizationB.resolve('organization-b-result');
organizationA.resolve('organization-a-stale-result');
await Promise.all([requestA, requestB]);

assert.deepEqual(accepted, ['organization-b-result']);
assert.equal(guardB.isActive('organization-a'), false);

console.log('PASS scoped request guard rejects stale cross-tenant responses');
