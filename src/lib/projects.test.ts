import { describe, expect, it } from 'vitest';
import { sortProjects, stageRank, type Project } from './projects';

describe('stageRank', () => {
	it('ranks earlier stages lower than later stages', () => {
		expect(stageRank('idea')).toBeLessThan(stageRank('prototype'));
		expect(stageRank('prototype')).toBeLessThan(stageRank('active'));
		expect(stageRank('active')).toBeLessThan(stageRank('archived'));
	});
});

describe('sortProjects', () => {
	const projects: Project[] = [
		{ name: 'Zeta', description: '', stage: 'active' },
		{ name: 'Alpha', description: '', stage: 'idea' },
		{ name: 'Beta', description: '', stage: 'active' },
		{ name: 'Gamma', description: '', stage: 'archived' },
	];

	it('orders projects by stage and then alphabetically by name', () => {
		const sorted = sortProjects(projects);
		expect(sorted.map((project) => project.name)).toEqual([
			'Alpha',
			'Beta',
			'Zeta',
			'Gamma',
		]);
	});

	it('does not mutate the input array', () => {
		const input = [...projects];
		sortProjects(input);
		expect(input).toEqual(projects);
	});
});
