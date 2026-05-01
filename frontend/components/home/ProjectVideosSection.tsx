import Link from "next/link";
import { Film } from "lucide-react";
import { projectVideoSlots } from "@/data/homepage";

export function ProjectVideosSection() {
  return (
    <section className="border-b border-blue-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              Project Videos
            </p>
            <h2 className="mt-2 text-3xl font-black">Watch real build work in motion</h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex h-11 w-fit items-center rounded-md border border-slate-300 px-5 text-sm font-black transition hover:bg-white"
          >
            Open Projects
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {projectVideoSlots.map((slot) => (
            <div key={slot} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
              <div className="flex aspect-video items-center justify-center rounded-md bg-blue-950 text-white">
                <Film className="h-10 w-10 text-cyan-200" />
              </div>
              <h3 className="mt-4 font-black">{slot}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                See electronics, software, testing, and final demo flow across project builds.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
