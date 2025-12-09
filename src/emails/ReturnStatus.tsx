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

interface ReturnStatusEmailProps {
    customerName: string;
    returnNumber: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
}

export default function ReturnStatusEmail({
    customerName,
    returnNumber,
    orderNumber,
    status,
    statusMessage,
}: ReturnStatusEmailProps) {
    const statusColors = {
        pending: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
        approved: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
        rejected: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
        processing: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
        completed: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    };

    const currentStatus = statusColors[status as keyof typeof statusColors] || statusColors.pending;

    return (
        <Html>
            <Head />
            <Preview>Return request #{returnNumber} status update</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Heading style={logo}>FeelItBuy</Heading>
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>Return Request Update</Heading>
                        <Text style={text}>Hi {customerName},</Text>
                        <Text style={text}>
                            Your return request has been updated.
                        </Text>

                        <Section style={{
                            ...statusBox,
                            backgroundColor: currentStatus.bg,
                            borderColor: currentStatus.border,
                        }}>
                            <Text style={{
                                ...statusLabel,
                                color: currentStatus.text,
                            }}>
                                Status
                            </Text>
                            <Text style={{
                                ...statusValue,
                                color: currentStatus.text,
                            }}>
                                {status.toUpperCase()}
                            </Text>
                            <Text style={{
                                ...statusMessageText,
                                color: currentStatus.text,
                            }}>
                                {statusMessage}
                            </Text>
                        </Section>

                        <Section style={detailsBox}>
                            <Text style={detailLabel}>Return Number</Text>
                            <Text style={detailValue}>#{returnNumber}</Text>
                            <Text style={detailLabel}>Order Number</Text>
                            <Text style={detailValue}>#{orderNumber}</Text>
                        </Section>

                        <Section style={buttonSection}>
                            <Link
                                href={`https://feelitbuy.com/returns/${returnNumber}`}
                                style={button}
                            >
                                View Return Details
                            </Link>
                        </Section>
                    </Section>

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

const statusBox = {
    border: '2px solid',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const statusLabel = {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
};

const statusValue = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 12px',
};

const statusMessageText = {
    fontSize: '14px',
    margin: '0',
};

const detailsBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
};

const detailLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '8px 0 4px',
};

const detailValue = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 8px',
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
