// Articles are owned by Marketing (Sunil and Ameya) and reviewed by AI/Engineering leaders before publishing.
// Body content is plain text rendered by React (never as HTML) so it is safe to edit here.

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  summary: string;
  topic: "Enterprise AI" | "AI agents" | "Automation" | "Cloud & data" | "Software engineering";
  published: string; // ISO date
  readingMinutes: number;
  serviceSlug: string;
  body: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "before-you-build-an-ai-agent",
    title: "Before you build an AI agent: six questions to answer first",
    summary:
      "AI agents can complete real work across business systems, but only when the task, data and controls are defined up front. A short checklist for leaders planning their first agent.",
    topic: "AI agents",
    published: "2026-10-28",
    readingMinutes: 4,
    serviceSlug: "business-analysis",
    body: [
      {
        type: "p",
        text: "An AI agent is software that uses a language model to plan and carry out a sequence of steps, such as reading a request, looking up records and updating a system. That makes agents more useful than a chat assistant, and also riskier. Most failed agent projects fail before any code is written, because the work was never defined clearly enough to automate.",
      },
      { type: "h2", text: "1. What exact task will the agent complete?" },
      {
        type: "p",
        text: "Describe the task as a person would do it today: the trigger, the steps, the systems involved and what done looks like. If the process varies widely between people, standardise it first.",
      },
      { type: "h2", text: "2. How will you measure success?" },
      {
        type: "p",
        text: "Agree a baseline before you start: time per task, error rate, backlog size or cost per transaction. Without a baseline you cannot show value or decide whether to scale.",
      },
      { type: "h2", text: "3. What data and systems does it need?" },
      {
        type: "p",
        text: "List every source the agent must read and every system it must change. Check that each one has a reliable API or integration route, and that the data is accurate enough to act on.",
      },
      { type: "h2", text: "4. Where must a person stay in the loop?" },
      {
        type: "p",
        text: "Decide which actions the agent may take on its own and which need approval. Payments, customer communications and changes to master data usually need a human check at first.",
      },
      { type: "h2", text: "5. What could go wrong, and how will you know?" },
      {
        type: "list",
        items: [
          "Log every action the agent takes, with the inputs it used.",
          "Set limits on what it can access, using the same least-privilege rules as any other system user.",
          "Test with realistic and adversarial inputs before go-live.",
          "Monitor quality after launch, not only uptime.",
        ],
      },
      { type: "h2", text: "6. Who owns it after launch?" },
      {
        type: "p",
        text: "Agents need ongoing ownership: someone to review performance, update instructions and handle exceptions. Name that owner before you build.",
      },
      {
        type: "p",
        text: "Answering these questions usually takes a short discovery sprint. It is the fastest way to find out whether an agent is the right tool, and what it would take to run one safely in production.",
      },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
