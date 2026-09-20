import MatchupDetailPage from "@/app/matchups/[matchId]/page";

export const metadata = {
  title: "Matchup — familia de nuñez",
  robots: { index: false, follow: false },
};

export default function SharedMatchupDetailPage(props) {
  return <MatchupDetailPage {...props} basePath="/league/matchups" />;
}
