const stripe = require('stripe')('sk_test_IgWOZDfCQqQtoH7Y3z0k0cB900qJBhH0zd');
const Users = require('../models/users');

export class StripeController {
  async capturePayment({ amount, email }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      await Users.findOneAndUpdate(
        { email: email },
        { $set: { balance: amount } },
        { new: true, runValidators: true }
      );
      return {
        message: 'Payment Captured Successfully',
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
