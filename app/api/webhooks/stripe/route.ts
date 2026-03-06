import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe (requires STRIPE_SECRET_KEY in env)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice paid:", invoice.id);
        // TODO: Update contract/invoice status in database
        // await prisma.invoice.updateMany({
        //   where: { stripeInvoiceId: invoice.id },
        //   data: { status: "paid", paidAt: new Date() }
        // });
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment failed:", invoice.id);
        // TODO: Update contract/invoice status
        break;
      }
      
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription created:", subscription.id);
        // TODO: Activate contract
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);
        // TODO: Deactivate contract
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed:", session.id);
        // TODO: Handle successful payment
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
