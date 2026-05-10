import { PaymentClient } from "@/components/checkout/PaymentClient";

type PaymentPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = await params;

  return <PaymentClient orderId={orderId} />;
}
