import 'react-native-gesture-handler';
import { StyleSheet, ImageBackground } from 'react-native';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import logo from './assets/images/logo.png';
import { auth, bd, storage } from './firebaseConfig';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import CustomDrawerContent from './Drawer';
import { UserProvider } from './UserContext.js';
//// page imports ////
import homePage from './src/pages/Home/Home.js';
import loginPage from './src/pages/Login/Login.js';
import signUpPage from './src/pages/SignUp/SignUp.js';
import confirmEmailPage from './src/pages/ConfirmEmail/ConfirmEmail.js';
import forgotPasswordPage from './src/pages/ForgotPassword/ForgotPassword.js';
import newPasswordPage from './src/pages/NewPassword/NewPassword.js';
import profilePage from './src/pages/Profile/Profile.js';
import newGroupsPage from './src/pages/NewGroup/NewGroup.js';
import gListPage from './src/pages/GroupList/GroupList.js';
import newRidePage from './src/pages/NewRide/NewRide.js';

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
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="homeScreen" component={homePage} options={{ title: 'Home', headerTitle: ""}} />
      <Drawer.Screen name="profileScreen" component={profilePage} options={{ title: 'Profile', headerTitle: "" }} />
      <Drawer.Screen name="newRideScreen" component={newRidePage} options={{ title: 'New Ride', headerTitle: "" }} />
      <Drawer.Screen name="newGroupsScreen" component={newGroupsPage} options={{ title: 'New Group', headerTitle: "" }} />
      <Drawer.Screen name="gListScreen" component={gListPage} options={{ title: 'Group List', headerTitle: "" }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return subscriber;
  }, []);

  if (loading) {
    return (
      <ImageBackground source={logo} style={styles.imageContainer} resizeMode='contain'>
      </ImageBackground>
    );
  }

  return (
    <UserProvider>
      <ActionSheetProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ActionSheetProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  }
});
