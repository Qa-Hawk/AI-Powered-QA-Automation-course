import { faker } from '@faker-js/faker';

export type ProgramInput = {
  name: string;
  description: string;
};

/**
 * Unique program payload for happy-path create/edit flows.
 * Override individual fields when a scenario needs a fixed value.
 */
export function buildProgram(overrides: Partial<ProgramInput> = {}): ProgramInput {
  return {
    name: `Program ${faker.commerce.department()} ${faker.string.alphanumeric(8)}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
