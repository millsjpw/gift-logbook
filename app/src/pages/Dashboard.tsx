import Layout from "../components/Layout";
import UpcomingBirthdaysCard from "../components/UpcomingBirthdaysCard";
import RecentListsCard from "../components/RecentListsCard";

export default function Dashboard() {
  return (
    <Layout>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <UpcomingBirthdaysCard />
        <RecentListsCard />
      </div>
    </Layout>
  );
}
