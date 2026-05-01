import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700">
        ✓
      </div>
      <h1 className="mt-6 text-4xl font-black">Order placed successfully</h1>
      <p className="mt-3 text-sm font-semibold text-slate-500">
        {params.orderId ? `Order ID: ${params.orderId}` : "Your order is confirmed."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/components" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black">
          Continue Shopping
        </Link>
        <Link href="/profile" className="rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          View Profile
        </Link>
      </div>
    </div>
  );
}
