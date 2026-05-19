"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, STOREFRONT_URL } from "@/config/env";
import { emptyProductForm, emptyProjectForm } from "@/config/forms";
import type { AdminOrder, AdminOrderStatus, AdminSection, CategoryNode, Product, ProductForm, Project, ProjectForm } from "@/types";
import { priceLabel, productToForm } from "@/utils";
import { fetchProducts, buildProductPayload, archiveProduct, createProduct, updateProduct } from "@/api/products";
import { fetchCategoryTree } from "@/api/categories";
import { fetchAllOrders, updateOrderStatus } from "@/api/orders";
import { fetchProjects, createProject, updateProjectById, deleteProjectById, buildProjectBody } from "@/api/projects";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { DashboardView, type StatCard } from "./sections/DashboardView";
import { CatalogBrowser } from "./sections/CatalogBrowser";
import { ProductsView } from "./sections/ProductsView";
import { CategoriesView } from "./sections/CategoriesView";
import { ProjectsView } from "./sections/ProjectsView";
import { OrdersView } from "./sections/OrdersView";
import { MediaView } from "./sections/MediaView";
import { SettingsView } from "./sections/SettingsView";
import { useAdmin } from "@/core/context/AdminContext";

export function AdminConsole() {
  const { token, setToken, userLabel, setUserLabel, status, setStatus, isLoading, setIsLoading, isAutoLogging, logout } = useAdmin();

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [renameCategoryValue, setRenameCategoryValue] = useState("");
  const [renameSubcategoryValue, setRenameSubcategoryValue] = useState("");
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const [productList, categoryTree, projectList, orderList] = await Promise.all([
        fetchProducts(token).catch(() => [] as Product[]),
        fetchCategoryTree(token || undefined),
        fetchProjects(token || undefined),
        token ? fetchAllOrders(token) : Promise.resolve([] as AdminOrder[]),
      ]);
      setProducts(productList);
      setCategories(categoryTree);
      setProjects(projectList);
      setOrders(orderList);
      setStatus("Dashboard refreshed");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedCategory && categories[0]) {
      setSelectedCategory(categories[0].category);
    }
  }, [categories, selectedCategory]);

  const selectedCategoryNode = useMemo(
    () => categories.find((c) => c.category === selectedCategory) || categories[0],
    [categories, selectedCategory],
  );

  const selectedSubcategoryNode = useMemo(
    () => selectedCategoryNode?.subcategories.find((s) => s.name === selectedSubcategory),
    [selectedCategoryNode, selectedSubcategory],
  );

  const catalogProducts = useMemo(() => {
    if (selectedSubcategoryNode) return selectedSubcategoryNode.products;
    return selectedCategoryNode?.subcategories.flatMap((s) => s.products) || products;
  }, [products, selectedCategoryNode, selectedSubcategoryNode]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      [p.name, p.sku || "", p.category, p.subcategory, p.brand || "", p.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [productSearch, products]);

  const filteredCategoryProducts = useMemo(() => {
    const q = categorySearch.toLowerCase();
    return catalogProducts.filter((p) =>
      `${p.name} ${p.brand || ""} ${p.sku || ""}`.toLowerCase().includes(q),
    );
  }, [catalogProducts, categorySearch]);

  const stats = useMemo<StatCard[]>(() => {
    const active = products.filter((p) => p.isActive);
    const totalStockValue = products.reduce((s, p) => s + p.unitPriceCents * p.stockQuantity, 0);
    return [
      { label: "Products", value: products.length, detail: `${active.length} active` },
      { label: "Categories", value: categories.length, detail: "Derived from catalog" },
      {
        label: "Subcategories",
        value: categories.reduce((s, c) => s + c.subcategories.length, 0),
        detail: "Browse groups",
      },
      { label: "Best Sellers", value: products.filter((p) => p.isBestSeller).length, detail: "Homepage picks" },
      { label: "Low Stock", value: products.filter((p) => p.stockQuantity <= 10).length, detail: "10 or less" },
      { label: "Orders", value: orders.length, detail: "Admin visible" },
      { label: "Stock Value", value: priceLabel(totalStockValue), detail: "Catalog estimate" },
    ];
  }, [categories, orders.length, products]);

  function openProductEditor(product?: Product, targetSection: AdminSection = "products") {
    setProductForm(product ? productToForm(product) : emptyProductForm);
    setActiveSection(targetSection);
    setSidebarOpen(false);
  }

  function createProductIn(category: string, subcategory?: string) {
    setProductForm({ ...emptyProductForm, category, subcategory: subcategory || "General" });
    setActiveSection("products");
    setSidebarOpen(false);
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) { setStatus("Not authenticated."); return; }
    setIsLoading(true);
    try {
      const payload = buildProductPayload(productForm);
      if (productForm.id) {
        await updateProduct(productForm.id, payload, token);
        setStatus(`Updated ${productForm.name}`);
      } else {
        await createProduct(payload, token);
        setStatus(`Created ${productForm.name}`);
      }
      setProductForm(emptyProductForm);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleArchiveProduct(product: Product) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (!window.confirm(`Archive ${product.name}?`)) return;
    setIsLoading(true);
    try {
      await archiveProduct(product.id, token);
      setStatus(`Archived ${product.name}`);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to archive product");
    } finally {
      setIsLoading(false);
    }
  }

  async function patchProducts(targets: Product[], bodyFactory: (p: Product) => Record<string, unknown>, label: string) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (targets.length === 0) { setStatus("No products found for this operation."); return; }
    setIsLoading(true);
    try {
      await Promise.all(targets.map((p) => updateProduct(p.id, bodyFactory(p), token)));
      setStatus(label);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Bulk update failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRenameCategory() {
    const nextName = renameCategoryValue.trim();
    if (!selectedCategoryNode || !nextName) { setStatus("Select a category and enter the new name."); return; }
    const targets = selectedCategoryNode.subcategories.flatMap((s) => s.products);
    await patchProducts(targets, () => ({ category: nextName }), `Renamed category to ${nextName}`);
    setSelectedCategory(nextName);
    setRenameCategoryValue("");
  }

  async function handleRenameSubcategory() {
    const nextName = renameSubcategoryValue.trim();
    if (!selectedSubcategoryNode || !nextName) { setStatus("Select a subcategory and enter the new name."); return; }
    await patchProducts(selectedSubcategoryNode.products, () => ({ subcategory: nextName }), `Renamed subcategory to ${nextName}`);
    setSelectedSubcategory(nextName);
    setRenameSubcategoryValue("");
  }

  async function handleArchiveGroup(targets: Product[], label: string) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (!window.confirm(`Archive all products in ${label}?`)) return;
    setIsLoading(true);
    try {
      await Promise.all(targets.map((p) => archiveProduct(p.id, token)));
      setStatus(`Archived ${label}`);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to archive group");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateOrderStatus(order: AdminOrder, newStatus: AdminOrderStatus) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (order.status === newStatus) { setStatus(`Order ${order.id} is already ${newStatus}.`); return; }
    setIsLoading(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus, token);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setStatus(`Order ${order.id} moved to ${newStatus}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) { setStatus("Not authenticated."); return; }
    setIsLoading(true);
    try {
      const body = buildProjectBody(projectForm);
      if (projectForm.id) {
        await updateProjectById(projectForm.id, body, token);
        setStatus(`Updated project ${projectForm.title}`);
      } else {
        await createProject(body, token);
        setStatus(`Created project ${projectForm.title}`);
      }
      setProjectForm(emptyProjectForm);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteProject(project: Project) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    setIsLoading(true);
    try {
      await deleteProjectById(project.id, token);
      setStatus(`Deleted project ${project.title}`);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  }

  function selectProject(project: Project) {
    setProjectForm({
      ...emptyProjectForm,
      id: project.id,
      title: project.title,
      summary: project.summary || "",
      description: project.description || project.summary || `${project.title} project details.`,
      category: project.category,
      difficulty: project.difficulty,
      youtubeUrl: project.youtubeUrl || "",
      thumbnailUrl: project.thumbnailUrl || "",
      estimatedCost: project.estimatedCostCents ? String(project.estimatedCostCents / 100) : "",
      estimatedBuildTimeMinutes: project.estimatedBuildTimeMinutes ? String(project.estimatedBuildTimeMinutes) : "",
      tags: project.tags ? project.tags.join(", ") : "",
      preBuiltAvailable: project.preBuiltAvailable || false,
      preBuiltPrice: project.preBuiltPriceCents ? String(project.preBuiltPriceCents / 100) : "",
      preBuiltStock: project.preBuiltStock ? String(project.preBuiltStock) : "",
      isFeatured: project.isFeatured,
      isPublic: project.isPublic,
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AdminSidebar
        activeSection={activeSection}
        isOpen={sidebarOpen}
        onSelect={setActiveSection}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <AdminHeader
          activeSection={activeSection}
          status={status}
          isLoading={isLoading}
          userLabel={userLabel}
          hasToken={!!token}
          onRefresh={() => void loadDashboard()}
          onLogout={logout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="px-5 py-6 lg:px-8">
          {isAutoLogging && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent shrink-0" />
              <p className="text-sm font-semibold text-slate-600">Authenticating via session...</p>
            </div>
          )}

          {!isAutoLogging && !token && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">Authentication Required</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">Sign in via RoboRoot to continue</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Log in with an admin account on the storefront, then return here.
                  </p>
                </div>
                <a
                  href={`${STOREFRONT_URL}/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/")}`}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800 transition-colors"
                >
                  Sign in to RoboRoot
                </a>
              </div>
            </div>
          )}

          {activeSection === "dashboard" && (
            <DashboardView
              stats={stats}
              products={products}
              categories={categories}
              projects={projects}
              onEditProduct={openProductEditor}
              onSelectSection={setActiveSection}
            />
          )}

          {activeSection === "catalog" && (
            <CatalogBrowser
              categories={categories}
              selectedCategory={selectedCategoryNode}
              selectedSubcategory={selectedSubcategory}
              products={filteredCategoryProducts}
              search={categorySearch}
              onSearch={setCategorySearch}
              onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
              onSelectSubcategory={setSelectedSubcategory}
              onEditProduct={(p) => openProductEditor(p)}
              onArchiveProduct={handleArchiveProduct}
            />
          )}

          {activeSection === "products" && (
            <ProductsView
              productForm={productForm}
              products={filteredProducts}
              productSearch={productSearch}
              isLoading={isLoading}
              onSearch={setProductSearch}
              onForm={setProductForm}
              onSubmit={handleSaveProduct}
              onNew={() => setProductForm(emptyProductForm)}
              onEdit={(p) => setProductForm(productToForm(p))}
              onArchive={handleArchiveProduct}
            />
          )}

          {activeSection === "categories" && (
            <CategoriesView
              categories={categories}
              selectedCategory={selectedCategoryNode}
              selectedSubcategory={selectedSubcategoryNode}
              renameCategoryValue={renameCategoryValue}
              renameSubcategoryValue={renameSubcategoryValue}
              onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
              onSelectSubcategory={setSelectedSubcategory}
              onRenameCategory={setRenameCategoryValue}
              onRenameSubcategory={setRenameSubcategoryValue}
              onRenameCategorySubmit={() => void handleRenameCategory()}
              onRenameSubcategorySubmit={() => void handleRenameSubcategory()}
              onCreateProduct={createProductIn}
              onArchiveGroup={handleArchiveGroup}
            />
          )}

          {activeSection === "projects" && (
            <ProjectsView
              projectForm={projectForm}
              projects={projects}
              isLoading={isLoading}
              onForm={setProjectForm}
              onSubmit={handleSaveProject}
              onNew={() => setProjectForm(emptyProjectForm)}
              onSelectProject={selectProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeSection === "orders" && (
            <OrdersView orders={orders} isLoading={isLoading} onUpdateStatus={handleUpdateOrderStatus} />
          )}

          {activeSection === "media" && (
            <MediaView products={products} onEditProduct={(p) => openProductEditor(p, "products")} />
          )}

          {activeSection === "settings" && (
            <SettingsView apiBaseUrl={API_BASE_URL} token={token} userLabel={userLabel} />
          )}
        </main>
      </div>
    </div>
  );
}
