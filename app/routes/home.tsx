import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import TopologyViewer from "../components/TopologyViewer";;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <main>
        <TopologyViewer />
      </main>
    </div>
  );
}
