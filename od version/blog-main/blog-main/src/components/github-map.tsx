import { BlurFade } from "@/components/magicui/blur-fade";

import GitHubCalendar from "react-github-calendar";

interface GitHubMapProps {
  username: string;
  year?: number | "last";
}

function GitHubMap({ year = "last", username = "1chooo" }: GitHubMapProps) {
  return (
    <section
      id="github-calendar"
      className="my-8 outline-1 outline-gray-200 dark:outline-gray-700 rounded-2xl overflow-hidden p-4"
    >
      <BlurFade inView delay={0.4} direction="down">
        <GitHubCalendar
          year={year}
          username={username}
          blockSize={12}
          blockMargin={4}
          blockRadius={2}
          fontSize={14}
          style={{ fontWeight: "bold" }}
        />
      </BlurFade>
    </section>
  );
}

export { GitHubMap };
export default GitHubMap;
