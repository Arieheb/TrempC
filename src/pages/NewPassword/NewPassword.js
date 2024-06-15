import React, {useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const NewPassword = () => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const {height} = useWindowDimensions();
    const navigation = useNavigation();



    const navigateToLogin = () => {
        navigation.navigate('loginScreen');
    };

    
    const navigateToHome = () => {
        navigation.navigate('homeScreen');
    };

    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Reset Your Password</Text>
                
                <CustomInput 
                    placeholder="Enter Confirmation Code" 
                    value={code} 
                    setValue={setCode}
                    />

                <CustomInput 
                    placeholder="Enter New Password" 
                    value={newPassword} 
                    setValue={setNewPassword}
                    secureTextEntry
                     />


                <CustomButton
                    text = "Submit"
                    onPress={navigateToHome}
                     />

                <CustomButton 
                    text = "Back To Sign In" 
                    onPress={navigateToLogin} 
                    type = "TERTIARY"

                    />
                
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
        fontSize: 30,
        fontWeight: 'bold',
        margin: 15,
        padding: 15,
    },
    text: {
        color: "gray",
        // margin: 10,
        padding: 5,
        marginVertical: 10,
    
    },
    link: {
        color: 'blue',
    }
});

export default NewPassword;