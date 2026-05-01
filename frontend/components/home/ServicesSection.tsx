import { services } from "@/data/homepage";
import { homeIcons } from "./home-icons";

export function ServicesSection() {
  return (
    <section className="border-y border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
            Our Services
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Projects for students, institutions, and companies
          </h2>
        </div>
        <div className="overflow-x-auto pb-3 scrollbar-hide">
          <div className="flex min-w-max gap-4">
            {services.map((service) => {
              const Icon = homeIcons[service.icon];

              return (
                <div
                  key={service.title}
                  className="w-72 shrink-0 rounded-lg border border-blue-100 bg-slate-50 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-blue-700 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    {service.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
