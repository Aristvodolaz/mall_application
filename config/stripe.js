const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    // Создание платежа за билет
    createPayment: async (amount, currency = 'rub') => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Конвертация в копейки
                currency
            });
            return paymentIntent;
        } catch (error) {
            throw new Error('Ошибка при создании платежа: ' + error.message);
        }
    },

    // Создание продукта для события
    createEventProduct: async (event) => {
        try {
            const product = await stripe.products.create({
                name: event.title,
                description: event.description
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(event.price * 100),
                currency: 'rub'
            });

            return {
                productId: product.id,
                priceId: price.id
            };
        } catch (error) {
            throw new Error('Ошибка при создании продукта: ' + error.message);
        }
    },

    // Подтверждение платежа
    confirmPayment: async (paymentIntentId) => {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            throw new Error('Ошибка при подтверждении платежа: ' + error.message);
        }
    },

    // Возврат средств
    createRefund: async (paymentIntentId) => {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId
            });
            return refund;
        } catch (error) {
            throw new Error('Ошибка при возврате средств: ' + error.message);
        }
    }
}; 