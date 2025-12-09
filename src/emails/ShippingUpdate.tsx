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

interface ShippingUpdateEmailProps {
    customerName: string;
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    trackingUrl: string;
}

export default function ShippingUpdateEmail({
    customerName,
    orderNumber,
    trackingNumber,
    carrier,
    estimatedDelivery,
    trackingUrl,
}: ShippingUpdateEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your order #{orderNumber} has been shipped!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>FeelItBuy</Heading>
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>📦 Your Order is On Its Way!</Heading>
                        <Text style={text}>Hi {customerName},</Text>
                        <Text style={text}>
                            Great news! Your order has been shipped and is on its way to you.
                        </Text>

                        <Section style={trackingBox}>
                            <Text style={trackingLabel}>Tracking Number</Text>
                            <Text style={trackingNumber}>{trackingNumber}</Text>
                            <Text style={carrierText}>Carrier: {carrier}</Text>
                            <Text style={estimatedText}>
                                Estimated Delivery: {estimatedDelivery}
                            </Text>
                        </Section>

                        <Section style={buttonSection}>
                            <Link href={trackingUrl} style={button}>
                                Track Your Package
                            </Link>
                        </Section>

                        <Text style={text}>
                            Order Number: <strong>#{orderNumber}</strong>
                        </Text>
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

const trackingBox = {
    backgroundColor: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const trackingLabel = {
    color: '#065f46',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
};

const trackingNumber = {
    color: '#047857',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    margin: '0 0 16px',
};

const carrierText = {
    color: '#065f46',
    fontSize: '14px',
    margin: '4px 0',
};

const estimatedText = {
    color: '#065f46',
    fontSize: '14px',
    fontWeight: '600',
    margin: '8px 0 0',
};

const buttonSection = {
    margin: '32px 0',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#10b981',
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
