import 'react-native-gesture-handler';
import { StyleSheet, ImageBackground } from 'react-native';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDoc } from 'firebase/firestore/lite';
import logo from './assets/images/logo.png';
import { auth, bd, storage } from './firebaseConfig';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import CustomDrawerContent from './Drawer'; // Import your CustomDrawerContent component
import { useNavigation } from '@react-navigation/native';
import newRidePage from './src/pages/NewRide/NewRide.js';







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
// import historyPage from './pages/History/History.js';
// import newRidePage from './pages/NewRide/NewRide.js';
// import SearchPage from './pages/Search/SearchRide.js';


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
      <Stack.Screen name="gListScreen" component={gListPage} options={{ title: 'Group List', headerTitle: "" }} />

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

// import 'react-native-gesture-handler';
// import { StyleSheet } from 'react-native';
// import * as React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import { initializeApp } from 'firebase/app';
// // import { getFirestore, collection, getDoc } from 'firebase/firestore/lite';
// import logo from './assets/images/logo.png';
// //// page imports ////
// import homePage from './src/pages/Home/Home.js';
// import loginPage from './src/pages/Login/Login.js';
// import signUpPage from './src/pages/SignUp/SignUp.js';
// import confirmEmailPage from './src/pages/ConfirmEmail/ConfirmEmail.js';
// import forgotPasswordPage from './src/pages/ForgotPassword/ForgotPassword.js';
// import newPasswordPage from './src/pages/NewPassword/NewPassword.js';
// import profilePage from './src/pages/Profile/Profile.js';
// // import gListPage from './pages/Group/GroupList.js';
// // import gNewPage from './pages/Group/NewGroup.js';
// // import historyPage from './pages/History/History.js';
// // import newRidePage from './pages/NewRide/NewRide.js';
// // import SearchPage from './pages/Search/SearchRide.js';





// import { useState, useEffect } from 'react';
// import { ImageBackground } from 'react-native';
// import { auth, db, storage } from './firebaseConfig';



// const Stack = createNativeStackNavigator()

// export default function App() {
  
  
//   const [user, setUser] = useState();
//   const [loading, setLoad] = useState(true);
//   // Handle user state changes
//   function onAuthStateChanged(user) {
//     setUser(user);
//   }
//   useEffect(() => {
//     const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
//     setTimeout(()=>setLoad(false),1000)
//     return subscriber; // unsubscribe on unmount
//   }, []);
  
  
//   if(loading){
//     return(
//       <ImageBackground source={logo} style={{width:'100%', height:'100%'}} resizeMode='contain'>
//       </ImageBackground>
//     )
//   }
  
  
  
  
//   return (
//     <NavigationContainer>
//       <Stack.Navigator >
//         <Stack.Screen name="loginScreen" component={loginPage} options={{title:null}}/>
//         <Stack.Screen name="forgotPasswordScreen" component={forgotPasswordPage} options={{title:null}}/>
//         <Stack.Screen name="newPasswordScreen" component={newPasswordPage} options={{title:null}} />
//         <Stackk.Screen name="confirmScreen" component={confirmEmailPage} options={{title:null}}/>
//         <Stack.Screen name="signUpScreen" component={signUpPage} options={{title:null}}/>
//         <Stack.Screen name="homeScreen" component={homePage} options={{title:null}}/>
//         <Stack.Screen name="profileScreen" component={profilePage} options={{title:null}}/>
// {/* 
//          />
//         <Stack.Screen name="gListScreen" component={gListPage} />
//         <Stack.Screen name="gNewScreen" component={gNewPage} />
//         <Stack.Screen name="historyScreen" component={historyPage} />
//         <Stack.Screen name="newRideScreen" component={newRidePage} />
//         <Stack.Screen name="searchScreen" component={SearchPage} /> */}

//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   imageContainer: {
//     flex: 1,
//     // paddingTop: 58,
//     width: '100%',
//     height: '100%'
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 18,
//   }

// });
