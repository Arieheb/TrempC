// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import logo from './assets/images/logo.png';
import CustomDrawerContent from './Drawer'; // Import your CustomDrawerContent component
import loginPage from './src/pages/Login/Login.js';
import signUpPage from './src/pages/SignUp/SignUp.js';
import confirmEmailPage from './src/pages/ConfirmEmail/ConfirmEmail.js';
import forgotPasswordPage from './src/pages/ForgotPassword/ForgotPassword.js';
import newPasswordPage from './src/pages/NewPassword/NewPassword.js';
import profilePage from './src/pages/Profile/Profile.js';
import homePage from './src/pages/Home/Home.js';
import newRidePage from './src/pages/NewRide/NewRide.js';
import { auth } from './firebaseConfig';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="loginScreen" component={loginPage} options={{ title: null }} />
      <Stack.Screen name="forgotPasswordScreen" component={forgotPasswordPage} options={{ title: null }} />
      <Stack.Screen name="newPasswordScreen" component={newPasswordPage} options={{ title: null }} />
      <Stack.Screen name="confirmScreen" component={confirmEmailPage} options={{ title: null }} />
      <Stack.Screen name="signUpScreen" component={signUpPage} options={{ title: null }} />
      <Stack.Screen name="homeScreen" component={homePage} options={{ title: null }} />
      <Stack.Screen name="profileScreen" component={profilePage} options={{ title: null }} />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="homeScreen" component={homePage} options={{ title: 'Home', headerTitle: ""}} />
      <Drawer.Screen name="profileScreen" component={profilePage} options={{ title: 'Profile', headerTitle: "" }} />
      <Drawer.Screen name="newRideScreen" component={newRidePage} options={{ title: 'New Ride', headerTitle: "" }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    // Unsubscribe from the listener when component unmounts
    return subscriber;
  }, []);

  if (loading) {
    return (
      <ImageBackground source={logo} style={styles.imageContainer} resizeMode='contain'>
      </ImageBackground>
    );
  }

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        {user ? <DrawerNavigator /> : <AuthStack />}
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
});
