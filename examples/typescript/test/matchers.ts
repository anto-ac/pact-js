import { like as pactLike, eachLike as pactEachLike } from '@pact-foundation/pact/dsl/matchers';

export function like<T>(value: T): T {
  return pactLike(value) as unknown as T;
}

export function eachLike<T>(value: T): T[] {
  return pactEachLike(value) as unknown as T[];
}
