import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GroupList = () => {
   
    return (
        <View style={styles.container}>
            <Text style={styles.title}>ברוכים הבאים למסך רשימת הקבוצות</Text>
            <Text style={styles.subtitle}>שימוש מהנה</Text>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
    },
});

export default GroupList;