import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


//// page imports ////
import homePage from './src/pages/Home/Home.js';
import loginPage from './src/pages/Login/Login.js';
import signUpPage from './src/pages/SignUp/SignUp.js';
import confirmEmailPage from './src/pages/ConfirmEmail/ConfirmEmail.js';
import forgotPasswordPage from './src/pages/ForgotPassword/ForgotPassword.js';
import newPasswordPage from './src/pages/NewPassword/NewPassword.js';

// import profilePage from './pages/Profile/Profile.js';
// import gListPage from './pages/Group/GroupList.js';
// import gNewPage from './pages/Group/NewGroup.js';
// import historyPage from './pages/History/History.js';
// import newRidePage from './pages/NewRide/NewRide.js';
// import SearchPage from './pages/Search/SearchRide.js';



const stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <stack.Navigator>
        <stack.Screen name="loginScreen" component={loginPage} />
        <stack.Screen name="forgotPasswordScreen" component={forgotPasswordPage}/>
        <stack.Screen name="newPasswordScreen" component={newPasswordPage}  />
        <stack.Screen name="confirmScreen" component={confirmEmailPage} />
        <stack.Screen name="signUpScreen" component={signUpPage} />
        <stack.Screen name="homeScreen" component={homePage} />
{/* 
        <stack.Screen name="profileScreen" component={profilePage} />
        <stack.Screen name="gListScreen" component={gListPage} />
        <stack.Screen name="gNewScreen" component={gNewPage} />
        <stack.Screen name="historyScreen" component={historyPage} />
        <stack.Screen name="newRideScreen" component={newRidePage} />
        <stack.Screen name="searchScreen" component={SearchPage} /> */}

      </stack.Navigator>
    </NavigationContainer>
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
    // paddingTop: 58,
    width: '100%',
    height: '100%'
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  }

});
