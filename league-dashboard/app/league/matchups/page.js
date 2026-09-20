import MatchupsPage from "@/app/matchups/page";

export const metadata = {
  title: "Matchups — familia de nuñez",
  robots: { index: false, follow: false },
};

export default function SharedMatchupsPage(props) {
  return <MatchupsPage {...props} basePath="/league/matchups" shared />;
}
