import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface DeliveryConfirmationEmailProps {
    customerName: string;
    orderNumber: string;
    deliveryDate: string;
}

export default function DeliveryConfirmationEmail({
    customerName,
    orderNumber,
    deliveryDate,
}: DeliveryConfirmationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your order #{orderNumber} has been delivered!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>FeelItBuy</Heading>
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>🎉 Order Delivered!</Heading>
                        <Text style={text}>Hi {customerName},</Text>
                        <Text style={text}>
                            Your order has been successfully delivered on {deliveryDate}.
                        </Text>

                        <Section style={successBox}>
                            <Text style={successIcon}>✓</Text>
                            <Text style={successText}>Delivery Confirmed</Text>
                            <Text style={orderText}>Order #{orderNumber}</Text>
                        </Section>

                        <Text style={text}>
                            We hope you love your purchase! If you have any questions or concerns,
                            please don't hesitate to contact us.
                        </Text>

                        <Section style={buttonSection}>
                            <Link
                                href={`https://feelitbuy.com/orders/${orderNumber}/review`}
                                style={button}
                            >
                                Write a Review
                            </Link>
                        </Section>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2025 FeelItBuy. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 24px',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'center' as const,
};

const logo = {
    color: '#4f46e5',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
};

const content = {
    padding: '24px',
};

const h1 = {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 16px',
};

const text = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 12px',
};

const successBox = {
    backgroundColor: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '32px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const successIcon = {
    color: '#10b981',
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 12px',
};

const successText = {
    color: '#047857',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 8px',
};

const orderText = {
    color: '#065f46',
    fontSize: '14px',
    margin: '0',
};

const buttonSection = {
    margin: '32px 0',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#4f46e5',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
};

const footer = {
    borderTop: '1px solid #e5e7eb',
    padding: '24px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#6b7280',
    fontSize: '12px',
    margin: '4px 0',
};
