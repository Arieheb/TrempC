import React from 'react';
import { View,StyleSheet, Text, TextInput } from 'react-native';
import { keyboardType } from 'react-native';

const CustomInput = ({value, setValue, placeholder,secureTextEntry }) => {
    return (
        <View style={styles.container}>
            <TextInput 
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                style={styles.input}
                keyboardType={keyboardType ? keyboardType : 'default'}
                secureTextEntry={secureTextEntry} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '95%',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 7,
        
    },
    input:{
        padding: 8,
    }

})

export default CustomInput;