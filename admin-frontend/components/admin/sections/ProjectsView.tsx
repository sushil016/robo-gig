"use client";

/* eslint-disable @next/next/no-img-element */

import type { FormEvent } from "react";
import type { Project, ProjectForm } from "@/types";
import { projectCategories } from "@/config/forms";
import { compactType } from "@/utils";

export function ProjectsView({
  projectForm,
  projects,
  isLoading,
  onForm,
  onSubmit,
  onNew,
  onSelectProject,
  onDeleteProject,
}: {
  projectForm: ProjectForm;
  projects: Project[];
  isLoading: boolean;
  onForm: (value: ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Project Manager</p>
            <h2 className="mt-1 text-2xl font-black">{projectForm.id ? "Edit project" : "Create project"}</h2>
          </div>
          <button type="button" onClick={onNew} className="admin-action">New</button>
        </div>

        {projectForm.thumbnailUrl && (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 aspect-video">
            <img src={projectForm.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Basic Info</legend>
          <input className="admin-input" placeholder="Project title *" value={projectForm.title} onChange={(e) => onForm({ ...projectForm, title: e.target.value })} required />
          <input className="admin-input" placeholder="Summary (short description)" value={projectForm.summary} onChange={(e) => onForm({ ...projectForm, summary: e.target.value })} />
          <textarea className="admin-textarea" placeholder="Full description *" value={projectForm.description} onChange={(e) => onForm({ ...projectForm, description: e.target.value })} required />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Classification</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="admin-input" value={projectForm.category} onChange={(e) => onForm({ ...projectForm, category: e.target.value })}>
              {projectCategories.map((cat) => <option key={cat} value={cat}>{compactType(cat)}</option>)}
            </select>
            <select className="admin-input" value={projectForm.difficulty} onChange={(e) => onForm({ ...projectForm, difficulty: e.target.value })}>
              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <input className="admin-input" placeholder="Tags, comma separated (e.g. arduino, sensor, IoT)" value={projectForm.tags} onChange={(e) => onForm({ ...projectForm, tags: e.target.value })} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Media</legend>
          <input className="admin-input" placeholder="Thumbnail image URL" value={projectForm.thumbnailUrl} onChange={(e) => onForm({ ...projectForm, thumbnailUrl: e.target.value })} />
          <input className="admin-input" placeholder="YouTube URL (project video)" value={projectForm.youtubeUrl} onChange={(e) => onForm({ ...projectForm, youtubeUrl: e.target.value })} />
          <input className="admin-input" placeholder="Additional image URLs, comma separated" value={projectForm.imageUrls} onChange={(e) => onForm({ ...projectForm, imageUrls: e.target.value })} />
          <input className="admin-input" placeholder="PDF/resource URLs, comma separated (optional)" value={projectForm.pdfUrls} onChange={(e) => onForm({ ...projectForm, pdfUrls: e.target.value })} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Estimates</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" type="number" min="0" step="0.01" placeholder="Estimated cost (INR)" value={projectForm.estimatedCost} onChange={(e) => onForm({ ...projectForm, estimatedCost: e.target.value })} />
            <input className="admin-input" type="number" min="0" placeholder="Build time (minutes)" value={projectForm.estimatedBuildTimeMinutes} onChange={(e) => onForm({ ...projectForm, estimatedBuildTimeMinutes: e.target.value })} />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Learning Content</legend>
          <textarea className="admin-textarea" placeholder="Learning outcomes (one per line)" value={projectForm.learningOutcomes} onChange={(e) => onForm({ ...projectForm, learningOutcomes: e.target.value })} />
          <textarea className="admin-textarea" placeholder="Prerequisites (one per line)" value={projectForm.prerequisites} onChange={(e) => onForm({ ...projectForm, prerequisites: e.target.value })} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Pre-Built Kit</legend>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={projectForm.preBuiltAvailable} onChange={(e) => onForm({ ...projectForm, preBuiltAvailable: e.target.checked })} />
            Pre-built kit available for purchase
          </label>
          {projectForm.preBuiltAvailable && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="admin-input" type="number" min="0" step="0.01" placeholder="Pre-built price (INR)" value={projectForm.preBuiltPrice} onChange={(e) => onForm({ ...projectForm, preBuiltPrice: e.target.value })} />
              <input className="admin-input" type="number" min="0" placeholder="Stock quantity" value={projectForm.preBuiltStock} onChange={(e) => onForm({ ...projectForm, preBuiltStock: e.target.value })} />
            </div>
          )}
        </fieldset>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={projectForm.isFeatured} onChange={(e) => onForm({ ...projectForm, isFeatured: e.target.checked })} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={projectForm.isPublic} onChange={(e) => onForm({ ...projectForm, isPublic: e.target.checked })} />
            Public (visible to all)
          </label>
        </div>

        <button className="h-11 w-full rounded-md bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800 transition-colors" disabled={isLoading}>
          {projectForm.id ? "Update Project" : "Create Project"}
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">All Projects</p>
            <h2 className="mt-1 text-2xl font-black">{projects.length} build services</h2>
          </div>
        </div>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md bg-slate-900">
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/30">
                    {project.youtubeUrl ? "▶" : project.title[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-base truncate">{project.title}</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{project.category} · {project.difficulty}</p>
                {project.summary && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.summary}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.isFeatured && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-700">Featured</span>}
                  {project.preBuiltAvailable && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-700">Pre-built</span>}
                  {!project.isPublic && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-700">Draft</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onSelectProject(project)}
                  className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteProject(project)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="py-12 text-center text-sm font-black text-slate-400">
              No projects yet. Create your first project using the form.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
