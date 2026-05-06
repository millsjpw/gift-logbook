import Layout from "../components/Layout";
import UpcomingBirthdaysCard from "../components/UpcomingBirthdaysCard";

export default function Dashboard() {
  return (
    <Layout>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UpcomingBirthdaysCard />
      </div>
    </Layout>
  );
}
