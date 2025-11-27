import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddressListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Address List Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    text: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
});
