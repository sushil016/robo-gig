"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  STOREFRONT_URL,
  emptyProductForm,
  emptyProjectForm,
  productTypes,
  projectCategories,
  sectionItems,
} from "@/lib/admin/constants";
import type {
  AdminOrder,
  AdminOrderListResponse,
  AdminSection,
  CategoryNode,
  LoginResponse,
  Product,
  ProductForm,
  ProductListResponse,
  Project,
  ProjectForm,
  ProjectListResponse,
  ProductType,
} from "@/lib/admin/types";
import { compactType, priceLabel, productImage, productToForm, tagsToArray } from "@/lib/admin/utils";

type StatCard = {
  label: string;
  value: number | string;
  detail: string;
};

const categoryBackdrop =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";

export function AdminConsole() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [token, setToken] = useState("");
  const [userLabel, setUserLabel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [status, setStatus] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || payload.message || `Request failed: ${response.status}`);
    }

    return payload as T;
  }

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const orderPromise = token
        ? apiFetch<AdminOrderListResponse>("/api/orders/admin/all")
        : Promise.resolve({ success: true, data: [] });
      const [productPayload, categoryPayload, projectPayload, orderPayload] = await Promise.all([
        apiFetch<ProductListResponse>("/api/components?limit=200&sortBy=name&sortOrder=asc"),
        apiFetch<{ success: boolean; data: CategoryNode[] }>("/api/components/categories/tree"),
        apiFetch<ProjectListResponse>("/api/projects?limit=100"),
        orderPromise,
      ]);

      setProducts(productPayload.data);
      setCategories(categoryPayload.data);
      setProjects(projectPayload.data.projects);
      setOrders(orderPayload.data);
      setStatus("Dashboard refreshed");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("adminAccessToken") || "";
    const savedUser = localStorage.getItem("adminUserLabel") || "";

    setToken(savedToken);
    setUserLabel(savedUser);
  }, []);

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedCategory && categories[0]) {
      setSelectedCategory(categories[0].category);
    }
  }, [categories, selectedCategory]);

  const selectedCategoryNode = useMemo(() => {
    return categories.find((category) => category.category === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  const selectedSubcategoryNode = useMemo(() => {
    return selectedCategoryNode?.subcategories.find((subcategory) => subcategory.name === selectedSubcategory);
  }, [selectedCategoryNode, selectedSubcategory]);

  const catalogProducts = useMemo(() => {
    if (selectedSubcategoryNode) {
      return selectedSubcategoryNode.products;
    }

    return selectedCategoryNode?.subcategories.flatMap((subcategory) => subcategory.products) || products;
  }, [products, selectedCategoryNode, selectedSubcategoryNode]);

  const filteredProducts = useMemo(() => {
    const search = productSearch.toLowerCase();

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.sku || "",
        product.category,
        product.subcategory,
        product.brand || "",
        product.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [productSearch, products]);

  const filteredCategoryProducts = useMemo(() => {
    const search = categorySearch.toLowerCase();

    return catalogProducts.filter((product) => {
      const haystack = `${product.name} ${product.brand || ""} ${product.sku || ""}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [catalogProducts, categorySearch]);

  const stats = useMemo<StatCard[]>(() => {
    const activeProducts = products.filter((product) => product.isActive);
    const totalStockValue = products.reduce(
      (sum, product) => sum + product.unitPriceCents * product.stockQuantity,
      0
    );

    return [
      { label: "Products", value: products.length, detail: `${activeProducts.length} active` },
      { label: "Categories", value: categories.length, detail: "Derived from catalog" },
      {
        label: "Subcategories",
        value: categories.reduce((sum, category) => sum + category.subcategories.length, 0),
        detail: "Browse groups",
      },
      {
        label: "Best Sellers",
        value: products.filter((product) => product.isBestSeller).length,
        detail: "Homepage picks",
      },
      {
        label: "Low Stock",
        value: products.filter((product) => product.stockQuantity <= 10).length,
        detail: "10 or less",
      },
      { label: "Orders", value: orders.length, detail: "Admin visible" },
      { label: "Stock Value", value: priceLabel(totalStockValue), detail: "Catalog estimate" },
    ];
  }, [categories, orders.length, products]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const payload = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (payload.data.user.role !== "ADMIN") {
        throw new Error("This account is not an admin.");
      }

      setToken(payload.data.accessToken);
      setUserLabel(payload.data.user.name || payload.data.user.email);
      localStorage.setItem("adminAccessToken", payload.data.accessToken);
      localStorage.setItem("adminUserLabel", payload.data.user.name || payload.data.user.email);
      setStatus("Logged in");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminUserLabel");
    setToken("");
    setUserLabel("");
    setStatus("Logged out");
  }

  function openProductEditor(product?: Product, targetSection: AdminSection = "products") {
    setProductForm(product ? productToForm(product) : emptyProductForm);
    setActiveSection(targetSection);
    setSidebarOpen(false);
  }

  function createProductIn(category: string, subcategory?: string) {
    setProductForm({
      ...emptyProductForm,
      category,
      subcategory: subcategory || "General",
    });
    setActiveSection("products");
    setSidebarOpen(false);
  }

  function productPayloadFromForm() {
    return {
      name: productForm.name,
      sku: productForm.sku || undefined,
      description: productForm.description || undefined,
      typicalUseCase: productForm.typicalUseCase || undefined,
      vendorLink: productForm.vendorLink || undefined,
      imageUrl: productForm.imageUrl || undefined,
      category: productForm.category,
      subcategory: productForm.subcategory,
      productType: productForm.productType,
      brand: productForm.brand || undefined,
      tags: tagsToArray(productForm.tags),
      unitPriceCents: Math.round(Number(productForm.unitPrice || 0) * 100),
      stockQuantity: Number(productForm.stockQuantity || 0),
      isBestSeller: productForm.isBestSeller,
      isRobomaniacItem: productForm.isRobomaniacItem,
      isSoftware: productForm.isSoftware,
      isActive: productForm.isActive,
    };
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus("Login as admin before saving products.");
      return;
    }

    setIsLoading(true);
    try {
      if (productForm.id) {
        await apiFetch(`/api/components/${productForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(productPayloadFromForm()),
        });
        setStatus(`Updated ${productForm.name}`);
      } else {
        await apiFetch("/api/components", {
          method: "POST",
          body: JSON.stringify(productPayloadFromForm()),
        });
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
    if (!token) {
      setStatus("Login as admin before archiving products.");
      return;
    }

    if (!window.confirm(`Archive ${product.name}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch(`/api/components/${product.id}`, { method: "DELETE" });
      setStatus(`Archived ${product.name}`);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to archive product");
    } finally {
      setIsLoading(false);
    }
  }

  async function patchProducts(targets: Product[], bodyFactory: (product: Product) => Record<string, unknown>, label: string) {
    if (!token) {
      setStatus("Login as admin before changing catalog structure.");
      return;
    }

    if (targets.length === 0) {
      setStatus("No products found for this operation.");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        targets.map((product) =>
          apiFetch(`/api/components/${product.id}`, {
            method: "PATCH",
            body: JSON.stringify(bodyFactory(product)),
          })
        )
      );
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

    if (!selectedCategoryNode || !nextName) {
      setStatus("Select a category and enter the new name.");
      return;
    }

    const targets = selectedCategoryNode.subcategories.flatMap((subcategory) => subcategory.products);
    await patchProducts(targets, () => ({ category: nextName }), `Renamed category to ${nextName}`);
    setSelectedCategory(nextName);
    setRenameCategoryValue("");
  }

  async function handleRenameSubcategory() {
    const nextName = renameSubcategoryValue.trim();

    if (!selectedSubcategoryNode || !nextName) {
      setStatus("Select a subcategory and enter the new name.");
      return;
    }

    await patchProducts(
      selectedSubcategoryNode.products,
      () => ({ subcategory: nextName }),
      `Renamed subcategory to ${nextName}`
    );
    setSelectedSubcategory(nextName);
    setRenameSubcategoryValue("");
  }

  async function handleArchiveGroup(targets: Product[], label: string) {
    if (!token) {
      setStatus("Login as admin before archiving catalog groups.");
      return;
    }

    if (!window.confirm(`Archive all products in ${label}? This hides the group from the store.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(targets.map((product) => apiFetch(`/api/components/${product.id}`, { method: "DELETE" })));
      setStatus(`Archived ${label}`);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to archive group");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus("Login as admin before saving projects.");
      return;
    }

    const body = {
      title: projectForm.title,
      summary: projectForm.summary || undefined,
      description: projectForm.description,
      category: projectForm.category,
      difficulty: projectForm.difficulty,
      youtubeUrl: projectForm.youtubeUrl || undefined,
      estimatedCostCents: projectForm.estimatedCost
        ? Math.round(Number(projectForm.estimatedCost) * 100)
        : undefined,
      estimatedBuildTimeMinutes: projectForm.estimatedBuildTimeMinutes
        ? Number(projectForm.estimatedBuildTimeMinutes)
        : undefined,
      isFeatured: projectForm.isFeatured,
      isPublic: projectForm.isPublic,
      tags: ["admin-created"],
    };

    setIsLoading(true);
    try {
      if (projectForm.id) {
        await apiFetch(`/api/projects/${projectForm.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setStatus(`Updated project ${projectForm.title}`);
      } else {
        await apiFetch("/api/projects", {
          method: "POST",
          body: JSON.stringify(body),
        });
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

  function selectProject(project: Project) {
    setProjectForm({
      ...emptyProjectForm,
      id: project.id,
      title: project.title,
      summary: project.summary || "",
      description:
        project.summary ||
        `${project.title} project details, build notes, required components, and admin-managed media.`,
      category: project.category,
      difficulty: project.difficulty,
      youtubeUrl: project.youtubeUrl || "",
      isFeatured: project.isFeatured,
      isPublic: project.isPublic,
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-slate-950 text-white transition lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">RoboRoot</p>
            <h1 className="mt-2 text-2xl font-black">Admin Console</h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">Products, projects, media, catalog structure.</p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {sectionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-black transition ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <a
              href={STOREFRONT_URL}
              className="block rounded-md bg-white px-4 py-3 text-center text-sm font-black text-slate-950"
            >
              Open Storefront
            </a>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                Menu
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{activeSection}</p>
                <h2 className="text-2xl font-black">Dashboard & Control Panel</h2>
                <p className="text-sm font-semibold text-slate-500">{status}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => void loadDashboard()} className="admin-action bg-white" disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh"}
              </button>
              {token ? (
                <button onClick={handleLogout} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-black text-white">
                  Logout {userLabel}
                </button>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Login required for edits</span>
              )}
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          {!token && (
            <LoginPanel
              email={email}
              password={password}
              isLoading={isLoading}
              onEmail={setEmail}
              onPassword={setPassword}
              onSubmit={handleLogin}
            />
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
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                setSelectedSubcategory("");
              }}
              onSelectSubcategory={setSelectedSubcategory}
              onEditProduct={(product) => openProductEditor(product)}
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
              onEdit={(product) => setProductForm(productToForm(product))}
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
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                setSelectedSubcategory("");
              }}
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
            />
          )}

          {activeSection === "orders" && <OrdersView orders={orders} />}

          {activeSection === "media" && (
            <MediaView
              products={products}
              onEditProduct={(product) => openProductEditor(product, "products")}
            />
          )}

          {activeSection === "settings" && (
            <SettingsView apiBaseUrl={API_BASE_URL} token={token} userLabel={userLabel} />
          )}
        </main>
      </div>
    </div>
  );
}

function OrdersView({ orders }: { orders: AdminOrder[] }) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmountCents, 0);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Orders</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Paid Orders</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{orders.filter((order) => order.status === "PAID").length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{priceLabel(totalRevenue)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Order Management</p>
          <h2 className="mt-1 text-2xl font-black">All customer orders</h2>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Shipping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-4">
                    <p className="font-black">{order.id}</p>
                    <p className="text-xs font-semibold text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")} / {order.status}</p>
                  </td>
                  <td>
                    <p className="font-black">{order.user?.name || "Customer"}</p>
                    <p className="text-xs font-semibold text-slate-500">{order.user?.email}</p>
                  </td>
                  <td>
                    <div className="max-w-sm space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="truncate text-xs font-bold text-slate-600">
                          {item.quantity} x {item.description}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td>
                    <p className="font-bold">{order.payments[0]?.gateway || "TEST"}</p>
                    <p className="text-xs text-slate-500">{order.payments[0]?.status || "CREATED"}</p>
                  </td>
                  <td className="font-black text-blue-700">{priceLabel(order.totalAmountCents)}</td>
                  <td>
                    <p className="font-bold">{order.address?.city}, {order.address?.state}</p>
                    <p className="text-xs text-slate-500">{order.address?.phone}</p>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm font-black text-slate-500">
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function LoginPanel({
  email,
  password,
  isLoading,
  onEmail,
  onPassword,
  onSubmit,
}: {
  email: string;
  password: string;
  isLoading: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mb-6 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Admin Login</p>
          <h2 className="mt-1 text-2xl font-black">Authenticate to edit catalog data</h2>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[220px_220px_auto]">
          <input
            type="email"
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="Admin email"
            className="admin-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => onPassword(event.target.value)}
            placeholder="Password"
            className="admin-input"
            required
          />
          <button className="h-11 rounded-md bg-blue-700 px-6 text-sm font-black text-white" disabled={isLoading}>
            Login
          </button>
        </form>
      </div>
    </section>
  );
}

function DashboardView({
  stats,
  products,
  categories,
  projects,
  onEditProduct,
  onSelectSection,
}: {
  stats: StatCard[];
  products: Product[];
  categories: CategoryNode[];
  projects: Project[];
  onEditProduct: (product?: Product, targetSection?: AdminSection) => void;
  onSelectSection: (section: AdminSection) => void;
}) {
  const lowStock = products.filter((product) => product.stockQuantity <= 10).slice(0, 5);
  const heroProduct = products.find((product) => product.imageUrl) || products[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-sm">
        <img src={productImage(heroProduct)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/50" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Control Room</p>
          <h2 className="mt-3 text-4xl font-black">Manage small parts, big systems, courses, projects, and media.</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
            This console controls products, category structure, subcategory browsing, Robomaniac items, project videos, and product imagery.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onSelectSection("products")} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-black text-white">
              Add Product
            </button>
            <button onClick={() => onSelectSection("catalog")} className="rounded-md bg-white px-4 py-2 text-sm font-black text-slate-950">
              Browse Catalog
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Category Health</p>
              <h3 className="mt-1 text-2xl font-black">Catalog groups</h3>
            </div>
            <button onClick={() => onSelectSection("categories")} className="admin-action">Manage</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.category}
                onClick={() => onSelectSection("catalog")}
                className="rounded-md border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="font-black">{category.category}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{category.count} products / {category.subcategories.length} subcategories</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Needs Attention</p>
          <h3 className="mt-1 text-2xl font-black">Low stock</h3>
          <div className="mt-5 space-y-3">
            {lowStock.length === 0 && <p className="text-sm font-semibold text-slate-500">No low-stock products.</p>}
            {lowStock.map((product) => (
              <button key={product.id} onClick={() => onEditProduct(product)} className="flex w-full gap-3 rounded-md border border-slate-200 p-3 text-left hover:bg-slate-50">
                <img src={productImage(product)} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-black">{product.name}</span>
                  <span className="text-xs font-bold text-red-600">{product.stockQuantity} left</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">{projects.length} projects are available in the admin workspace.</p>
        </div>
      </section>
    </div>
  );
}

function CatalogBrowser({
  categories,
  selectedCategory,
  selectedSubcategory,
  products,
  search,
  onSearch,
  onSelectCategory,
  onSelectSubcategory,
  onEditProduct,
  onArchiveProduct,
}: {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode;
  selectedSubcategory: string;
  products: Product[];
  search: string;
  onSearch: (value: string) => void;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
}) {
  const firstProduct = selectedCategory?.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <section className="relative min-h-72 overflow-hidden bg-slate-950 px-6 py-10 text-white">
        <img src={firstProduct ? productImage(firstProduct) : categoryBackdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 blur-sm scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950/80 to-black/60" />
        <div className="relative">
          <h2 className="text-center text-5xl font-black">← {selectedCategory?.category || "Catalog"}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-6">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => onSelectCategory(category.category)}
                className={`flex items-center gap-3 text-left transition ${
                  selectedCategory?.category === category.category ? "text-cyan-200" : "text-white/85 hover:text-white"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-xs font-black">
                  {category.category.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-black uppercase">{category.category}</span>
                  <span className="text-sm text-white/60">{category.count} Products</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 p-5">
          <h3 className="font-black uppercase tracking-wide text-slate-700">Stock Status</h3>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
            <label className="flex items-center gap-2"><input type="checkbox" /> In stock</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Best seller</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Robomaniac</label>
          </div>

          <div className="my-6 border-t border-slate-200" />
          <h3 className="font-black uppercase tracking-wide text-slate-700">Subcategories</h3>
          <div className="mt-4 space-y-1">
            <button
              onClick={() => onSelectSubcategory("")}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-bold ${
                !selectedSubcategory ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All in {selectedCategory?.category || "category"}
            </button>
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.name}
                onClick={() => onSelectSubcategory(subcategory.name)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold ${
                  selectedSubcategory === subcategory.name ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{subcategory.name}</span>
                <span className="text-xs text-slate-400">{subcategory.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="p-5">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-sm font-semibold text-slate-500">
              Home / {selectedCategory?.category || "Catalog"} {selectedSubcategory ? `/ ${selectedSubcategory}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-black">Show: 9 / 24 / 36</span>
              <input className="admin-input w-72" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search visible products" />
            </div>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} onEdit={onEditProduct} onArchive={onArchiveProduct} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductTile({
  product,
  onEdit,
  onArchive,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-52 items-center justify-center overflow-hidden rounded-md bg-white">
        {product.isBestSeller && (
          <span className="absolute right-2 top-2 z-10 bg-blue-600 px-2 py-1 text-xs font-black text-white">Best</span>
        )}
        <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain transition group-hover:scale-105" />
        <div className="absolute inset-x-3 bottom-3 hidden gap-2 group-hover:flex">
          <button onClick={() => onEdit(product)} className="flex-1 rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white">Edit</button>
          <button onClick={() => onArchive(product)} className="flex-1 rounded-md bg-white px-3 py-2 text-xs font-black text-slate-950 shadow">Archive</button>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-black leading-6 text-slate-800">{product.name}</h3>
      <p className="mt-1 text-xs font-bold text-slate-400">{product.brand || product.productType}</p>
      <p className="mt-2 text-sm font-black text-blue-700">{priceLabel(product.unitPriceCents)}</p>
    </article>
  );
}

function ProductsView({
  productForm,
  products,
  productSearch,
  isLoading,
  onSearch,
  onForm,
  onSubmit,
  onNew,
  onEdit,
  onArchive,
}: {
  productForm: ProductForm;
  products: Product[];
  productSearch: string;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onForm: (value: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <ProductFormPanel productForm={productForm} isLoading={isLoading} onForm={onForm} onSubmit={onSubmit} onNew={onNew} />

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Product Control</p>
            <h2 className="mt-1 text-2xl font-black">All components and products</h2>
          </div>
          <input className="admin-input md:w-80" placeholder="Search product, category, tag" value={productSearch} onChange={(event) => onSearch(event.target.value)} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3">
              <img src={productImage(product)} alt={product.name} className="h-24 w-24 rounded-md object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{product.name}</p>
                <p className="text-xs font-bold text-slate-500">{product.category} / {product.subcategory}</p>
                <p className="mt-2 font-black text-blue-700">{priceLabel(product.unitPriceCents)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="admin-action" onClick={() => onEdit(product)} type="button">Edit</button>
                  <button className="admin-action" onClick={() => onArchive(product)} type="button">Archive</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductFormPanel({
  productForm,
  isLoading,
  onForm,
  onSubmit,
  onNew,
}: {
  productForm: ProductForm;
  isLoading: boolean;
  onForm: (value: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Product Manager</p>
          <h2 className="mt-1 text-2xl font-black">{productForm.id ? "Edit product" : "Create product"}</h2>
        </div>
        <button type="button" onClick={onNew} className="admin-action">New</button>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <img src={productForm.imageUrl || productImage()} alt="" className="h-48 w-full object-contain" />
      </div>

      <div className="mt-5 grid gap-3">
        <input className="admin-input" placeholder="Product name" value={productForm.name} onChange={(event) => onForm({ ...productForm, name: event.target.value })} required />
        <input className="admin-input" placeholder="SKU" value={productForm.sku} onChange={(event) => onForm({ ...productForm, sku: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="admin-input" placeholder="Category" value={productForm.category} onChange={(event) => onForm({ ...productForm, category: event.target.value })} required />
          <input className="admin-input" placeholder="Subcategory" value={productForm.subcategory} onChange={(event) => onForm({ ...productForm, subcategory: event.target.value })} required />
        </div>
        <select className="admin-input" value={productForm.productType} onChange={(event) => onForm({ ...productForm, productType: event.target.value as ProductType })}>
          {productTypes.map((type) => <option key={type} value={type}>{compactType(type)}</option>)}
        </select>
        <input className="admin-input" placeholder="Brand" value={productForm.brand} onChange={(event) => onForm({ ...productForm, brand: event.target.value })} />
        <textarea className="admin-textarea" placeholder="Description" value={productForm.description} onChange={(event) => onForm({ ...productForm, description: event.target.value })} />
        <textarea className="admin-textarea" placeholder="Typical use case" value={productForm.typicalUseCase} onChange={(event) => onForm({ ...productForm, typicalUseCase: event.target.value })} />
        <input className="admin-input" placeholder="Image URL" value={productForm.imageUrl} onChange={(event) => onForm({ ...productForm, imageUrl: event.target.value })} />
        <input className="admin-input" placeholder="Vendor link" value={productForm.vendorLink} onChange={(event) => onForm({ ...productForm, vendorLink: event.target.value })} />
        <input className="admin-input" placeholder="Tags, comma separated" value={productForm.tags} onChange={(event) => onForm({ ...productForm, tags: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="admin-input" type="number" min="0" step="0.01" placeholder="Price INR" value={productForm.unitPrice} onChange={(event) => onForm({ ...productForm, unitPrice: event.target.value })} required />
          <input className="admin-input" type="number" min="0" placeholder="Stock" value={productForm.stockQuantity} onChange={(event) => onForm({ ...productForm, stockQuantity: event.target.value })} required />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["Best seller", "isBestSeller"],
            ["Robomaniac item", "isRobomaniacItem"],
            ["Software", "isSoftware"],
            ["Active", "isActive"],
          ].map(([label, key]) => (
            <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={Boolean(productForm[key as keyof ProductForm])}
                onChange={(event) => onForm({ ...productForm, [key]: event.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
        <button className="h-11 rounded-md bg-blue-700 px-5 text-sm font-black text-white" disabled={isLoading}>
          {productForm.id ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

function CategoriesView({
  categories,
  selectedCategory,
  selectedSubcategory,
  renameCategoryValue,
  renameSubcategoryValue,
  onSelectCategory,
  onSelectSubcategory,
  onRenameCategory,
  onRenameSubcategory,
  onRenameCategorySubmit,
  onRenameSubcategorySubmit,
  onCreateProduct,
  onArchiveGroup,
}: {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode;
  selectedSubcategory?: CategoryNode["subcategories"][number];
  renameCategoryValue: string;
  renameSubcategoryValue: string;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  onRenameCategory: (value: string) => void;
  onRenameSubcategory: (value: string) => void;
  onRenameCategorySubmit: () => void;
  onRenameSubcategorySubmit: () => void;
  onCreateProduct: (category: string, subcategory?: string) => void;
  onArchiveGroup: (targets: Product[], label: string) => void;
}) {
  const categoryProducts = selectedCategory?.subcategories.flatMap((subcategory) => subcategory.products) || [];

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Category CRUD</p>
            <h2 className="mt-1 text-2xl font-black">Categories and subcategories</h2>
          </div>
          <button onClick={() => onCreateProduct(selectedCategory?.category || "New Category")} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">
            Add product in category
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const hero = category.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl);
            return (
              <button
                key={category.category}
                onClick={() => onSelectCategory(category.category)}
                className={`overflow-hidden rounded-lg border text-left transition ${
                  selectedCategory?.category === category.category ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200"
                }`}
              >
                <div className="relative h-32 bg-slate-900">
                  <img src={productImage(hero)} alt="" className="h-full w-full object-cover opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-xl font-black text-white">{category.category}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-500">{category.count} products / {category.subcategories.length} subcategories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 4).map((subcategory) => (
                      <span key={subcategory.name} className="admin-pill">{subcategory.name}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Selected Category</p>
          <h3 className="mt-1 text-2xl font-black">{selectedCategory?.category || "No category"}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{categoryProducts.length} products inside this category.</p>
          <div className="mt-5 grid gap-3">
            <input className="admin-input" value={renameCategoryValue} onChange={(event) => onRenameCategory(event.target.value)} placeholder="Rename selected category" />
            <button onClick={onRenameCategorySubmit} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">Rename Category</button>
            <button onClick={() => onArchiveGroup(categoryProducts, selectedCategory?.category || "category")} className="rounded-md border border-red-200 px-4 py-2 text-sm font-black text-red-700">Archive Category Products</button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Subcategories</p>
          <div className="mt-4 space-y-2">
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.name}
                onClick={() => onSelectSubcategory(subcategory.name)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-bold ${
                  selectedSubcategory?.name === subcategory.name ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200"
                }`}
              >
                <span>{subcategory.name}</span>
                <span>{subcategory.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3">
            <input className="admin-input" value={renameSubcategoryValue} onChange={(event) => onRenameSubcategory(event.target.value)} placeholder="Rename selected subcategory" />
            <button onClick={onRenameSubcategorySubmit} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">Rename Subcategory</button>
            <button onClick={() => onCreateProduct(selectedCategory?.category || "New Category", selectedSubcategory?.name)} className="admin-action bg-white">Add product here</button>
            <button onClick={() => onArchiveGroup(selectedSubcategory?.products || [], selectedSubcategory?.name || "subcategory")} className="rounded-md border border-red-200 px-4 py-2 text-sm font-black text-red-700">Archive Subcategory Products</button>
          </div>
        </div>
      </aside>
    </section>
  );
}

function ProjectsView({
  projectForm,
  projects,
  isLoading,
  onForm,
  onSubmit,
  onNew,
  onSelectProject,
}: {
  projectForm: ProjectForm;
  projects: Project[];
  isLoading: boolean;
  onForm: (value: ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
  onSelectProject: (project: Project) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Project Manager</p>
            <h2 className="mt-1 text-2xl font-black">{projectForm.id ? "Edit project" : "Create project"}</h2>
          </div>
          <button type="button" onClick={onNew} className="admin-action">New</button>
        </div>
        <div className="mt-5 grid gap-3">
          <input className="admin-input" placeholder="Project title" value={projectForm.title} onChange={(event) => onForm({ ...projectForm, title: event.target.value })} required />
          <input className="admin-input" placeholder="Summary" value={projectForm.summary} onChange={(event) => onForm({ ...projectForm, summary: event.target.value })} />
          <textarea className="admin-textarea" placeholder="Description" value={projectForm.description} onChange={(event) => onForm({ ...projectForm, description: event.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="admin-input" value={projectForm.category} onChange={(event) => onForm({ ...projectForm, category: event.target.value })}>
              {projectCategories.map((category) => <option key={category} value={category}>{compactType(category)}</option>)}
            </select>
            <select className="admin-input" value={projectForm.difficulty} onChange={(event) => onForm({ ...projectForm, difficulty: event.target.value })}>
              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
            </select>
          </div>
          <input className="admin-input" placeholder="YouTube URL for landing/project video" value={projectForm.youtubeUrl} onChange={(event) => onForm({ ...projectForm, youtubeUrl: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" type="number" min="0" step="0.01" placeholder="Estimated cost INR" value={projectForm.estimatedCost} onChange={(event) => onForm({ ...projectForm, estimatedCost: event.target.value })} />
            <input className="admin-input" type="number" min="0" placeholder="Build time minutes" value={projectForm.estimatedBuildTimeMinutes} onChange={(event) => onForm({ ...projectForm, estimatedBuildTimeMinutes: event.target.value })} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
              <input type="checkbox" checked={projectForm.isFeatured} onChange={(event) => onForm({ ...projectForm, isFeatured: event.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
              <input type="checkbox" checked={projectForm.isPublic} onChange={(event) => onForm({ ...projectForm, isPublic: event.target.checked })} />
              Public
            </label>
          </div>
          <button className="h-11 rounded-md bg-blue-700 px-5 text-sm font-black text-white" disabled={isLoading}>
            {projectForm.id ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Projects</p>
        <h2 className="mt-1 text-2xl font-black">Build services and videos</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <button key={project.id} onClick={() => onSelectProject(project)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-blue-200 hover:bg-blue-50">
              <div className="flex aspect-video items-center justify-center rounded-md bg-slate-950 text-white">
                <span className="text-4xl font-black">{project.youtubeUrl ? "▶" : "P"}</span>
              </div>
              <p className="mt-4 font-black">{project.title}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{project.category} / {project.difficulty}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaView({ products, onEditProduct }: { products: Product[]; onEditProduct: (product: Product) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Images & Media</p>
          <h2 className="mt-1 text-2xl font-black">Product image library</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Click any item to update image URL, vendor link, tags, and homepage flags.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        {products.map((product) => (
          <button key={product.id} onClick={() => onEditProduct(product)} className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md">
            <div className="aspect-square bg-slate-50">
              <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-10 text-sm font-black">{product.name}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{product.imageUrl ? "Image set" : "Needs image"}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SettingsView({ apiBaseUrl, token, userLabel }: { apiBaseUrl: string; token: string; userLabel: string }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Environment</p>
        <h2 className="mt-1 text-2xl font-black">API and session</h2>
        <div className="mt-5 space-y-4 text-sm font-semibold">
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">API base URL</p>
            <p className="mt-1 font-black">{apiBaseUrl}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">Admin user</p>
            <p className="mt-1 font-black">{userLabel || "Not logged in"}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">Token</p>
            <p className="mt-1 font-black">{token ? "Stored in this browser" : "No active admin token"}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Operating Model</p>
        <h2 className="mt-1 text-2xl font-black">Catalog source of truth</h2>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
          Categories and subcategories are derived from product records. Rename and archive operations update the matching products, so the storefront category tree updates immediately from the backend.
        </p>
      </div>
    </section>
  );
}
