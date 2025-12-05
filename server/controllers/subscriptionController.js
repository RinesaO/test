const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Pharmacy = require('../models/Pharmacy');
const Subscription = require('../models/Subscription');

// @desc    Create checkout session
// @route   POST /api/subscription/create-checkout-session
// @access  Private (Pharmacy)
exports.createCheckoutSession = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Create or get Stripe customer
    let customerId = pharmacy.subscription.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          pharmacyId: pharmacy._id.toString()
        }
      });
      customerId = customer.id;
      pharmacy.subscription.stripeCustomerId = customerId;
      await pharmacy.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'PharmaCare Monthly Subscription',
              description: 'Monthly subscription to appear on PharmaCare platform'
            },
            unit_amount: 2999, // €29.99 in cents
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/subscription?canceled=true`,
      metadata: {
        pharmacyId: pharmacy._id.toString()
      }
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subscription status
// @route   GET /api/subscription/status
// @access  Private (Pharmacy)
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    let subscriptionDetails = null;

    if (pharmacy.subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          pharmacy.subscription.stripeSubscriptionId
        );
        subscriptionDetails = {
          status: stripeSubscription.status,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        };
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      success: true,
      subscription: {
        status: pharmacy.subscription.status,
        currentPeriodEnd: pharmacy.subscription.currentPeriodEnd,
        plan: pharmacy.subscription.plan,
        details: subscriptionDetails
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private (Pharmacy)
exports.cancelSubscription = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (!pharmacy.subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      pharmacy.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/subscription/webhook
// @access  Public (Stripe)
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions for webhook handlers
async function handleCheckoutCompleted(session) {
  const pharmacyId = session.metadata.pharmacyId;
  const pharmacy = await Pharmacy.findById(pharmacyId);

  if (pharmacy) {
    const subscription = await stripe.subscriptions.list({
      customer: session.customer,
      limit: 1
    });

    if (subscription.data.length > 0) {
      const sub = subscription.data[0];
      pharmacy.subscription.stripeSubscriptionId = sub.id;
      pharmacy.subscription.status = 'active';
      pharmacy.subscription.currentPeriodEnd = new Date(sub.current_period_end * 1000);
      pharmacy.isActive = true;
      await pharmacy.save();

      // Create subscription record
      await Subscription.findOneAndUpdate(
        { pharmacy: pharmacyId },
        {
          pharmacy: pharmacyId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end
        },
        { upsert: true, new: true }
      );
    }
  }
}

async function handleSubscriptionUpdate(subscription) {
  const pharmacy = await Pharmacy.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });

  if (pharmacy) {
    pharmacy.subscription.status = subscription.status;
    pharmacy.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    pharmacy.isActive = subscription.status === 'active';
    await pharmacy.save();

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    );
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId) {
    await handleSubscriptionUpdate({ id: subscriptionId });
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}

