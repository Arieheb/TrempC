import {React, useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {db, auth} from '../../../firebaseConfig';
import { updateProfile } from "firebase/auth";
import { addDoc, collection, setDoc } from 'firebase/firestore';
import { doc } from "firebase/firestore";
import { Alert } from 'react-native';


import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';

const uID ="";

const signUpProcess = async (email, password, firstName, lastName, phone) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uID = userCredential.user.uid;
        console.log(uID);


        await setDoc(doc(db, "users", uID),{
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
        });
        console.log('User added to Firestore: ', uID);
        Alert.alert('Success', 'User registered successfully!');
    } catch (error) {
    console.error('Error during sign up:', error);
    Alert.alert('Error', error.message);
  }
};
    
const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [firstName, setFirstName] =useState("")
    const [lastName, setLastName] =useState("")
    const [phone, setPhone] =useState("")

    const {height} = useWindowDimensions();
    const navigation = useNavigation();


    const handleSignUp = () => {
        signUpProcess(email, password, firstName, lastName, phone);
        navigation.navigate('homeScreen', {uID});
    };



    const onTermsOfUsePress = () => {
        console.warn('Terms of Use');
    }
    const onPrivacyPress = () => {
        console.warn('Privacy policy');
    }

    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    }




    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Create new account</Text>
                
                <CustomInput 
                    placeholder="First Name" 
                    value={firstName} 
                    setValue={setFirstName} />
                <CustomInput 
                    placeholder="Last Name" 
                    value={lastName} 
                    setValue={setLastName} />
                
                <CustomInput 
                    placeholder="Email" 
                    value={email} 
                    setValue={setEmail}
                     />

                <CustomInput 
                    placeholder="Phone Number" 
                    value={phone} 
                    setValue={setPhone}
                     />
                
                <CustomInput 
                    placeholder="Password" 
                    value={password} 
                    setValue={setPassword}
                    secureTextEntry
                     />

                <CustomInput 
                    placeholder="Repeat Password" 
                    value={passwordRepeat} 
                    setValue={setPasswordRepeat}
                    secureTextEntry
                     />

                <CustomButton 
                    text = "Register" 
                    onPress={handleSignUp}                    
                    />

                <Text style={styles.text}>By registering, you confirm that you accept our {''}
                    <Text style={styles.link} onPress={onTermsOfUsePress}>Terms of Use</Text> and {''}
                    <Text style={styles.link} onPress={onPrivacyPress}>Privacy policy</Text>
                </Text>
                
                <SocialSignInButtons />
                

                <CustomButton 
                    text = "Have an account? Sign In" 
                    onPress={onSignInPress} 
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

export default SignUp;