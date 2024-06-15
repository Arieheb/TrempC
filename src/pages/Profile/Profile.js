import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import {db, auth} from '../../../firebaseConfig';
import { updateProfile } from "firebase/auth";
import { addDoc, collection, setDoc, getDoc } from 'firebase/firestore';
import { doc } from "firebase/firestore";
import { Alert } from 'react-native';
import { useState } from 'react';
import CustomButton from '../../components/CustomButton';
import { ScrollView } from 'react-native-gesture-handler';


const Profile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] =useState("")
    const [lastName, setLastName] =useState("")
    const [phone, setPhone] =useState("")


    const navigation = useNavigation();


    const saveDataPress = async () => {
        console.log("saveData");
        
        // navigation.navigate('homeScreen');
    }
    const returnPress = () => {
        console.log("return");
        navigation.navigate('homeScreen');
    };
    const signOutPress = () => {
        console.log("signOut");
        auth.signOut();
    };


    return (
        <ScrollView>  
        <View style={styles.container}>
            
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
            
            {/* <CustomInput 
                placeholder="Password" 
                value={password} 
                setValue={setPassword}
                secureTextEntry
                    /> */}
            <CustomButton 
                text = "return" 
                onPress={returnPress}
                bgColor={'red'}

                    />       

            <CustomButton 
                text={"Save Changes"}
                onPress={saveDataPress}
                bgColor={'green'}
                // type = "PRIMARY"
                    />
                  
            <CustomButton 
                text = "Sign Out" 
                onPress={signOutPress}
                bgColor={'lightgrey'}
                border-color={'black'}
            />     

        </View>  
        </ScrollView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 30,
        paddingHorizontal: 10
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