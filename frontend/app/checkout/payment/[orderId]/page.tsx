import Link from "next/link";

type PaymentPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl font-black text-blue-700">
        ₹
      </div>
      <h1 className="mt-6 text-4xl font-black">Payment gateway setup pending</h1>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
        Order {orderId} was created in pending-payment mode. Connect PhonePe or Stripe credentials
        here when you are ready for live payments. Test payment already creates a paid order end to end.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/checkout" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black">
          Back to Checkout
        </Link>
        <Link href="/components" className="rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
