import React, {useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, Image, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {db, auth} from '../../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';


import Photo from '../../../assets/images/logo.png'
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';


const Login = props => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const {height} = useWindowDimensions();
    const navigation = useNavigation();


    const onForgotPasswordPress = () => {
        navigation.navigate('forgotPasswordScreen');
    }


    const signUpPress = () => {
        navigation.navigate('signUpScreen');
    }


    const handleSignIn = () => {   
        auth
        signInWithEmailAndPassword(auth, username, password)
        
        .then((userCredential) => {
            const user = userCredential.user;
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'homeScreen' }
                ],
            })
            )
            console.log(user.uid)
          })
          
          .catch(error => {
            Alert.alert('Error', error.message);           
            
          }
        );
          
    }

    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>            
                <Image 
                    source={Photo} 
                    style={[styles.logo, {height:height*0.3}]} 
                    resizeMode="contain" 
                />
                
                <CustomInput 
                    placeholder="Username" 
                    value={username} 
                    setValue={setUsername} />
                
                <CustomInput 
                    placeholder="Password" 
                    value={password} 
                    setValue={setPassword}
                    secureTextEntry
                     />

                <CustomButton 
                    text = "Sign In" 
                    onPress={handleSignIn}                 
                    />

                <CustomButton 
                    text = "Forgot Password?" 
                    onPress={onForgotPasswordPress} 
                    type = "TERTIARY"/>
                
                <CustomButton 
                    text = "Don't have an account? Sign Up" 
                    onPress={signUpPress} 
                    type = "TERTIARY"/>

                
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
    inputView: {
        backgroundColor: 'white',
        width: '95%',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,

        paddingHorizontal: 10,
        marginVertical: 5,        
    },
    input: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    }
});

export default Login;
