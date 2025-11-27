import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrderDetailScreen({ route }: any) {
    const { orderId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Order Detail Screen</Text>
            <Text style={styles.subtext}>Order ID: {orderId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    text: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
    subtext: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
