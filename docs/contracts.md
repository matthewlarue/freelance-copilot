# Contract Templates

## Freelance Service Agreement

**Parties:** This agreement is between [CLIENT NAME] ("Client") and [CONTRACTOR NAME] ("Contractor").

**Services:** Contractor agrees to provide the following services:
[SERVICE DESCRIPTION]

**Payment:**
- Total Project Value: $[AMOUNT]
- Payment Schedule: [e.g., 50% upfront, 50% upon completion]
- Payment Method: [Stripe invoice / Bank transfer / PayPal]

**Timeline:**
- Start Date: [DATE]
- Estimated Completion: [DATE]
- Revisions: [NUMBER] rounds included

**Intellectual Property:**
Upon full payment, all deliverables become the property of the Client.

**Confidentiality:**
Both parties agree to keep confidential any proprietary information shared during the engagement.

**Termination:**
Either party may terminate with [NUMBER] days written notice. Client agrees to pay for all work completed up to termination date.

**Signatures:**

Client: _________________________ Date: _________

Contractor: _________________________ Date: _________

---

## Quick Invoice Template

**INVOICE #** [INV-001]

**From:** [Your Name/Company]
**To:** [Client Name]
**Date:** [Invoice Date]
**Due Date:** [Due Date]

| Description | Amount |
|-------------|--------|
| [Service 1] | $0.00 |
| [Service 2] | $0.00 |
| | |
| **TOTAL** | **$0.00** |

**Payment Instructions:**
- Stripe: [Payment Link]
- Bank: [Account Details]
- PayPal: [Email]

---

## Stripe Integration Notes

To enable Stripe payments:

1. Get API keys from https://dashboard.stripe.com/apikeys
2. Add to .env.local:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Create products in Stripe dashboard
4. Use Stripe Checkout or Payment Intents API

**Webhook Events to Handle:**
- `invoice.paid` - Mark invoice as paid
- `invoice.payment_failed` - Mark as overdue
- `customer.subscription.created` - Activate contract
- `customer.subscription.deleted` - Deactivate contract
