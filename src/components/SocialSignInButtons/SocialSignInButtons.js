import { View, Text } from 'react-native'
import React from 'react'
import CustomButton from '../CustomButton'

const SocialSignInButtons = () => {
    
    const signInFacebookPress = () => {
        console.warn('facebook sign in');
    }

    const signInGooglePress = () => {
        console.warn('google sign in');
    }
  
  
  
    return (
    <>
       <CustomButton 
                    text = "Sign In with facebook" 
                    onPress={signInFacebookPress}
                    bgColor={'#E7E4F4'}
                    fgColor={'#4765A9'} 

                    />

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