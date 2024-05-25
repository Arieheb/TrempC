import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

const CustomButton = ({onPress, text, type = "PRIMARY", bgColor,fgColor}) => {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.container, 
        styles[`container_${type}`],
        bgColor ? {backgroundColor: bgColor} :{}  ]}>
        <Text 
          style={[
            styles.text, 
            styles[`text_${type}`],
            fgColor ? {color: fgColor} :{}
            
            
            ]}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    container: {
        width: '95%',
        
        padding: 10,
        marginVertical: 5,
        
        alignItems: 'center',
        borderRadius: 10,
    },

    container_PRIMARY: {
      backgroundColor: '#3B71F3',

    },

    container_SECONDARY: {
      borderColor: '#3B71F3',  
      borderWidth: 2,  
            
    },

    container_TERTIARY: {},

    text:{
      fontWeight: 'bold',
      color: 'white',
    },

    text_TERTIARY: {
        color: 'gray',
    },
    text_SECONDARY: {
        color: '#3B71F3',
    },








})

export default CustomButton