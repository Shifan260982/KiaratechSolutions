// Live vacancies only. Leave the list empty rather than publishing roles that are not open.
export const roleFamilies = [
  "Software engineering",
  "Full-stack and frontend",
  "Business analysis",
  "Scrum and delivery",
  "Test automation",
  "Cloud and data",
  "AI and machine learning",
] as const;

export type RoleFamily = (typeof roleFamilies)[number];

export type Job = {
  id: string;
  title: string;
  family: RoleFamily;
  location: string;
  type: "Permanent" | "Contract";
  summary: string;
};

export const jobs: Job[] = [];
