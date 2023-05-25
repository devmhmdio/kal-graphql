import dotenv from 'dotenv';
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_LIVE_SECRET_KEY);
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
        { $inc: { balance: amount } },
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
