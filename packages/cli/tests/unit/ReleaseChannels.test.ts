import { describe, expect, it, vi } from "vitest";

import {
    githubLatestTgzUrl,
    githubReleaseTgzUrl,
    readGitHubRepoFromPackage,
    recommendedCliUpgradeCommand,
    resolveLatestRelease
} from "../../src/update/ReleaseChannels";

describe("ReleaseChannels", () => {
    it("reads GitHub coordinates from the packaged repository URL", () => {
        expect(readGitHubRepoFromPackage()).toEqual({ owner: "callmeteus", repo: "stillmark" });
    });

    it("builds documented install URLs", () => {
        expect(githubLatestTgzUrl("callmeteus", "stillmark")).toBe(
            "https://github.com/callmeteus/stillmark/releases/latest/download/stillmark.tgz"
        );
        expect(githubReleaseTgzUrl("callmeteus", "stillmark", "0.2.0")).toBe(
            "https://github.com/callmeteus/stillmark/releases/download/v0.2.0/stillmark.tgz"
        );
    });

    it("falls back to GitHub when npm has no package", async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error("npm registry answered 404 for stillmark"))
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tag_name: "v0.2.0" })
            });

        vi.stubGlobal("fetch", fetchMock);

        const resolved = await resolveLatestRelease("stillmark", { owner: "callmeteus", repo: "stillmark" });

        expect(resolved).toEqual({
            version: "0.2.0",
            channel: "github",
            npmError: "npm registry answered 404 for stillmark"
        });
        expect(recommendedCliUpgradeCommand("0.2.0", "github")).toContain("releases/download/v0.2.0/stillmark.tgz");

        vi.unstubAllGlobals();
    });
});
