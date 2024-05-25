import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    const navigateToLogin = () => {
        navigation.navigate('loginScreen');
    };

    const navigateToProfile = () => {
        navigation.navigate('profileScreen');
    };
    
    const navigateToSignUp = () => {
        navigation.navigate('signUpScreen');
    };

    return (

        <ScrollView>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>ברוכים הבאים למסך הבית</Text>
                <Text style={styles.subtitle}>שימוש מהנה</Text>
                <Button title="למסך הכניסה" onPress={navigateToLogin} />
                <Button title="לפרופיל האישי" onPress={navigateToProfile} />
                <Button title="לרישום" onPress={navigateToSignUp} />
                <TextInput placeholder="הזן מייל" />
            </KeyboardAvoidingView>
        </ScrollView>
        
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

export default HomeScreen;