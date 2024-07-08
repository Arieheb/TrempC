import { View, Text } from 'react-native'
import React from 'react'
import CustomButton from '../CustomButton'

const SocialSignInButtons = () => {
    
    

    const signInGooglePress = () => {
        console.warn('google sign in');
    }
  
  
  
    return (
    <>
                <CustomButton 
                    text = "Sign In with google" 
                    onPress={signInGooglePress}
                    bgColor={'#FAE9EA'}
                    fgColor={'#DD4DD4'} 
                    

                />
    </>
  )
}

export default SocialSignInButtons