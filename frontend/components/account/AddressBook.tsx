"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addressApi } from "@/lib/api/address.api";
import type { Address, AddressInput } from "@/lib/types/marketplace.types";

const emptyAddress: AddressInput = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

function addressToForm(address: Address): AddressInput {
  return {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export function AddressBook() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<AddressInput>(emptyAddress);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
  });

  const addresses = useMemo(() => addressesQuery.data || [], [addressesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => (editingId ? addressApi.update(editingId, form) : addressApi.create(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingId("");
      setForm(emptyAddress);
      toast.success(editingId ? "Address updated" : "Address added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save address");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefault(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update default address");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove address");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function editAddress(address: Address) {
    setEditingId(address.id);
    setForm(addressToForm(address));
  }

  function removeAddress(address: Address) {
    if (!window.confirm(`Remove address for ${address.name}?`)) {
      return;
    }

    removeMutation.mutate(address.id);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-[#F3F3E4] p-5 shadow-sm lg:col-span-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Address Book</p>
          <h2 className="mt-1 text-2xl font-black">Saved shipping addresses</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Reuse addresses during checkout and set your preferred default.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId("");
            setForm(emptyAddress);
          }}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Address
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-3">
          {addressesQuery.isLoading && <p className="text-sm font-black text-slate-500">Loading addresses...</p>}
          {addresses.length === 0 && !addressesQuery.isLoading && (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-black text-slate-500">No saved addresses yet.</p>
            </div>
          )}
          {addresses.map((address) => (
            <article key={address.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black">{address.name}</p>
                    {address.isDefault && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">Default</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">{address.phone} / {address.country}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => defaultMutation.mutate(address.id)}
                      className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-xs font-black"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => editAddress(address)}
                    className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-xs font-black"
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAddress(address)}
                    className="inline-flex h-9 items-center rounded-md border border-red-200 px-3 text-xs font-black text-red-700"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xl font-black">{editingId ? "Edit address" : "Add address"}</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["name", "Full name"],
              ["phone", "Phone number"],
              ["line1", "Address line 1"],
              ["line2", "Address line 2"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
              ["country", "Country"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={String(form[key as keyof AddressInput] || "")}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
                className="h-11 rounded-md border border-slate-300 bg-[#F3F3E4] px-3 text-sm font-semibold outline-none focus:border-blue-600"
                required={key !== "line2"}
              />
            ))}
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-[#F3F3E4] px-3 py-3 text-sm font-black">
              <input
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
              />
              Make this my default shipping address
            </label>
            <button
              disabled={saveMutation.isPending}
              className="h-11 rounded-md bg-blue-700 px-5 text-sm font-black text-white disabled:bg-slate-300"
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Update Address" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
