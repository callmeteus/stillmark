import { CoverageTopic } from "./Coverage";
import { DesignTopic } from "./Design";
import { GitTopic } from "./Git";
import { InstallTopic } from "./Install";
import { NotifyTopic } from "./Notify";
import { PlanTopic } from "./Plan";
import { ReadmeTopic } from "./Readme";
import { RoadmapTopic } from "./Roadmap";
import { SettingsTopic } from "./Settings";
import { TopicGroup, type TopicDefinition } from "./TopicContent";

export { ContrastTone, MarkKind, TopicGroup, TopicId } from "./TopicContent";
export type { ContrastLine, ContrastScene, ExcerptMark, TopicCommand, TopicContrast, TopicCopy, TopicDefinition, TopicExample } from "./TopicContent";

/**
 * Every docs topic, grouped in sidebar order. The pager walks this order.
 */
export const Topics: TopicDefinition[] = [
    InstallTopic,
    SettingsTopic,
    RoadmapTopic,
    PlanTopic,
    CoverageTopic,
    DesignTopic,
    ReadmeTopic,
    GitTopic,
    NotifyTopic
];

/**
 * Sidebar groups in display order.
 */
export const TopicGroups: TopicGroup[] = [TopicGroup.START, TopicGroup.PLANNING, TopicGroup.QUALITY, TopicGroup.WORKFLOW];

/**
 * Topics of one group, in sidebar order.
 */
export function topicsInGroup(group: TopicGroup): TopicDefinition[] {
    return Topics.filter((topic) => topic.group === group);
}
