import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
    const navigation = useNavigation();

    const navigateToLogin = () => {
        navigation.navigate('loginScreen');
    };

    const navigateToHome = () => {
        navigation.navigate('homeScreen');
    };
    
    const navigateToSignUp = () => {
        navigation.navigate('signUpScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ברוכים הבאים למסך הפרופיל</Text>
            <Text style={styles.subtitle}>שימוש מהנה</Text>
            <Button title="למסך הכניסה" onPress={navigateToLogin} />
            <Button title="למסך הבית" onPress={navigateToHome} />
            <Button title="לרישום" onPress={navigateToSignUp} />
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

export default Profile;