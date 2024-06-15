// Drawer.js
import React from 'react';
import { View, Button } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { auth } from './firebaseConfig';

export default function CustomDrawerContent({ navigation, ...props }) {
  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'loginScreen' }],
        });
      })
      .catch(error => console.error(error));
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </DrawerContentScrollView>
  );
}
