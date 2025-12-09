import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '../emails/OrderConfirmation';
import ShippingUpdateEmail from '../emails/ShippingUpdate';
import DeliveryConfirmationEmail from '../emails/DeliveryConfirmation';
import ReturnStatusEmail from '../emails/ReturnStatus';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'orders@feelitbuy.com';

export interface OrderData {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    orderDate: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
}

export interface ShippingData {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    trackingUrl: string;
}

export interface DeliveryData {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    deliveryDate: string;
}

export interface ReturnData {
    customerName: string;
    customerEmail: string;
    returnNumber: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
}

class EmailService {
    async sendOrderConfirmation(data: OrderData) {
        try {
            const emailHtml = render(OrderConfirmationEmail(data));

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: data.customerEmail,
                subject: `Order Confirmation - #${data.orderNumber}`,
                html: emailHtml,
            });

            console.log('✅ Order confirmation email sent:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending order confirmation:', error);
            throw error;
        }
    }

    async sendShippingUpdate(data: ShippingData) {
        try {
            const emailHtml = render(ShippingUpdateEmail(data));

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: data.customerEmail,
                subject: `Your Order Has Shipped - #${data.orderNumber}`,
                html: emailHtml,
            });

            console.log('✅ Shipping update email sent:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending shipping update:', error);
            throw error;
        }
    }

    async sendDeliveryConfirmation(data: DeliveryData) {
        try {
            const emailHtml = render(DeliveryConfirmationEmail(data));

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: data.customerEmail,
                subject: `Order Delivered - #${data.orderNumber}`,
                html: emailHtml,
            });

            console.log('✅ Delivery confirmation email sent:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending delivery confirmation:', error);
            throw error;
        }
    }

    async sendReturnStatusUpdate(data: ReturnData) {
        try {
            const emailHtml = render(ReturnStatusEmail(data));

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: data.customerEmail,
                subject: `Return Request Update - #${data.returnNumber}`,
                html: emailHtml,
            });

            console.log('✅ Return status email sent:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending return status:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();
