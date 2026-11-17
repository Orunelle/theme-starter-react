import { createFileRoute } from "@tanstack/react-router";
import { PageSingle } from "../components/page/PageSingle";
export const Route = createFileRoute("/$locale/blogs/$slug")({
  component: () => (
    <PageSingle data={{ kind: "content", title: "Journal", paragraphs: [] }} />
  ),
});
