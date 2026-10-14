import type { LocaleId } from "../LocaleIds";

/**
 * Sections of the docs sidebar and command reference, in display order.
 */
export enum TopicGroup {
    START = "START",
    PLANNING = "PLANNING",
    QUALITY = "QUALITY",
    WORKFLOW = "WORKFLOW"
}

/**
 * Stable identifiers of the docs topics.
 */
export enum TopicId {
    INSTALL = "INSTALL",
    ROADMAP = "ROADMAP",
    PLAN = "PLAN",
    COVERAGE = "COVERAGE",
    DESIGN = "DESIGN",
    GIT = "GIT",
    NOTIFY = "NOTIFY",
    README = "README",
    CHANGELOG = "CHANGELOG",
    SETTINGS = "SETTINGS"
}

/**
 * How the changed line of an excerpt is marked in red pen.
 */
export enum MarkKind {
    /** Loop around a line that moved or changed. */
    CIRCLE = "CIRCLE",
    /** Line struck through: the change was refused or removed. */
    STRIKE = "STRIKE"
}

/**
 * The red-pen mark on one line of a file excerpt, with its margin note.
 */
export interface ExcerptMark {
    line: number;
    kind: MarkKind;
    note: string;
}

/**
 * One capability shown as a notebook entry: what you say, what runs, what changes.
 */
export interface TopicExample {
    title: string;
    say: string;
    run: string;
    file: string;
    lines: string[];
    mark: ExcerptMark;
    result: string;
}

/**
 * How a line of a contrast scene reads: a neutral line, something that went wrong, or something handled.
 */
export enum ContrastTone {
    PLAIN = "PLAIN",
    BAD = "BAD",
    GOOD = "GOOD"
}

/**
 * One line of a contrast scene.
 */
export interface ContrastLine {
    text: string;
    tone: ContrastTone;
}

/**
 * One side of the "without / with Stillmark" slider: a small window (chat, phone, file) and a caption under it.
 */
export interface ContrastScene {
    frame: string;
    lines: ContrastLine[];
    caption: string;
}

/**
 * What working looks like without Stillmark and with it, shown in the before/after slider.
 */
export interface TopicContrast {
    without: ContrastScene;
    with: ContrastScene;
}

/**
 * One row of a topic's command list.
 */
export interface TopicCommand {
    command: string;
    description: string;
}

/**
 * Localized copy of a guide topic.
 */
export interface TopicCopy {
    label: string;
    title: string;
    lead: string;
    summary: string;
    contrast?: TopicContrast;
    examples: TopicExample[];
    commands: TopicCommand[];
}

/**
 * A docs topic: identity, URL slug, sidebar group, and copy per locale.
 */
export interface TopicDefinition {
    id: TopicId;
    slug: string;
    group: TopicGroup;
    copy: Record<LocaleId, TopicCopy>;
}
