import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
    customerName: string;
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

export default function OrderConfirmationEmail({
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shipping,
    total,
    shippingAddress,
}: OrderConfirmationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your FeelItBuy order #{orderNumber} is confirmed!</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={logo}>FeelItBuy</Heading>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Heading style={h1}>✅ Order Confirmed!</Heading>
                        <Text style={text}>
                            Hi {customerName},
                        </Text>
                        <Text style={text}>
                            Thank you for your order! We're getting it ready to ship.
                        </Text>

                        {/* Order Details */}
                        <Section style={orderBox}>
                            <Row>
                                <Column>
                                    <Text style={orderLabel}>Order Number</Text>
                                    <Text style={orderValue}>#{orderNumber}</Text>
                                </Column>
                                <Column>
                                    <Text style={orderLabel}>Order Date</Text>
                                    <Text style={orderValue}>{orderDate}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Items */}
                        <Heading as="h2" style={h2}>
                            Order Items
                        </Heading>
                        {items.map((item, index) => (
                            <Section key={index} style={itemRow}>
                                <Row>
                                    <Column style={{ width: '80px' }}>
                                        <Img
                                            src={item.image}
                                            width="60"
                                            height="60"
                                            alt={item.name}
                                            style={itemImage}
                                        />
                                    </Column>
                                    <Column>
                                        <Text style={itemName}>{item.name}</Text>
                                        <Text style={itemDetails}>
                                            Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                        </Text>
                                    </Column>
                                    <Column align="right">
                                        <Text style={itemPrice}>
                                            ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        ))}

                        {/* Totals */}
                        <Section style={totalsSection}>
                            <Row>
                                <Column align="right">
                                    <Text style={totalLabel}>Subtotal:</Text>
                                </Column>
                                <Column align="right" style={{ width: '100px' }}>
                                    <Text style={totalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column align="right">
                                    <Text style={totalLabel}>Shipping:</Text>
                                </Column>
                                <Column align="right" style={{ width: '100px' }}>
                                    <Text style={totalValue}>₹{shipping.toLocaleString('en-IN')}</Text>
                                </Column>
                            </Row>
                            <Row style={totalRow}>
                                <Column align="right">
                                    <Text style={totalLabelBold}>Total:</Text>
                                </Column>
                                <Column align="right" style={{ width: '100px' }}>
                                    <Text style={totalValueBold}>₹{total.toLocaleString('en-IN')}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Shipping Address */}
                        <Heading as="h2" style={h2}>
                            Shipping Address
                        </Heading>
                        <Section style={addressBox}>
                            <Text style={addressText}>
                                {shippingAddress.street}<br />
                                {shippingAddress.city}, {shippingAddress.state}<br />
                                {shippingAddress.pincode}
                            </Text>
                        </Section>

                        {/* CTA Button */}
                        <Section style={buttonSection}>
                            <Link
                                href={`https://feelitbuy.com/orders/${orderNumber}`}
                                style={button}
                            >
                                Track Your Order
                            </Link>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Questions? Contact us at{' '}
                            <Link href="mailto:support@feelitbuy.com" style={link}>
                                support@feelitbuy.com
                            </Link>
                        </Text>
                        <Text style={footerText}>
                            © 2025 FeelItBuy. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
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

const h2 = {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '24px 0 12px',
};

const text = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 12px',
};

const orderBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
};

const orderLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
};

const orderValue = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0',
};

const itemRow = {
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
};

const itemImage = {
    borderRadius: '8px',
    objectFit: 'cover' as const,
};

const itemName = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px',
};

const itemDetails = {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0',
};

const itemPrice = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
};

const totalsSection = {
    borderTop: '2px solid #e5e7eb',
    marginTop: '16px',
    paddingTop: '16px',
};

const totalLabel = {
    color: '#6b7280',
    fontSize: '14px',
    margin: '4px 0',
};

const totalValue = {
    color: '#1f2937',
    fontSize: '14px',
    margin: '4px 0',
};

const totalRow = {
    borderTop: '1px solid #e5e7eb',
    marginTop: '8px',
    paddingTop: '8px',
};

const totalLabelBold = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '4px 0',
};

const totalValueBold = {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '4px 0',
};

const addressBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '12px 0',
};

const addressText = {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
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
    lineHeight: '16px',
    margin: '4px 0',
};

const link = {
    color: '#4f46e5',
    textDecoration: 'underline',
};
