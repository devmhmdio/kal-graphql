const stripe = require('stripe')('sk_test_IgWOZDfCQqQtoH7Y3z0k0cB900qJBhH0zd');
const Users = require('../models/users');

export class StripeController {
  async capturePayment({ amount, email }) {
    try {
      await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });
      await Users.findOneAndUpdate(
        { email: email },
        { $set: { balance: amount } },
        { new: true, runValidators: true }
      );
      return 'Payment Captured Successfully';
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
