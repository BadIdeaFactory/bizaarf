export type ProjectStage = 'idea' | 'prototype' | 'active' | 'archived';

export interface Project {
	name: string;
	description: string;
	stage: ProjectStage;
	url?: string;
}

// The order in which stages are presented to visitors, from newest spark to
// long-running effort. Used to group and sort the showcase listing.
const STAGE_ORDER: readonly ProjectStage[] = [
	'idea',
	'prototype',
	'active',
	'archived',
];

export const stageRank = (stage: ProjectStage): number =>
	STAGE_ORDER.indexOf(stage);

// Sort projects by stage (following STAGE_ORDER) and then alphabetically by
// name within a stage. Returns a new array; the input is left untouched.
export const sortProjects = (projects: readonly Project[]): Project[] =>
	[...projects].sort((a, b) => {
		const byStage = stageRank(a.stage) - stageRank(b.stage);
		return byStage !== 0 ? byStage : a.name.localeCompare(b.name);
	});
