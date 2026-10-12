/** Line span in source file (0-based, end exclusive). */
export interface LineSpan {
    startLine: number;
    endLine: number;
}

/** Parsed roadmap checklist item. */
export interface RoadmapItem {
    id: string;
    title: string;
    checked: boolean;
    metadataLine: string;
    metadataSpan: LineSpan;
    itemSpan: LineSpan;
    sectionTitle: string;
    acceptanceLines: string[];
}

/** Parsed task plan task block. */
export interface PlanTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    depends: string[];
    blockedBy: string[];
    acceptanceCriteria: string[];
    verification: string[];
    blockSpan: LineSpan;
    sectionSpan: LineSpan;
}

/** Parsed task plan document. */
export interface TaskPlanDocument {
    raw: string;
    objective: string;
    inScope: string[];
    outOfScope: string[];
    tasks: PlanTask[];
    historySpan: LineSpan | null;
}

/** Parsed roadmap document. */
export interface RoadmapDocument {
    raw: string;
    sections: RoadmapSection[];
}

export interface RoadmapSection {
    title: string;
    headerSpan: LineSpan;
    items: RoadmapItem[];
    contentEndLine: number;
}

export type PlanningDestination = "roadmap" | "plan";
