import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddAddressScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Add Address Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    text: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
});
