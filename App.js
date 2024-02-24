import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Image } from 'react-native';

const PlaceholderImage = require('./assets/background-image.jpg');

export default function App() {
  return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={PlaceholderImage} style={styles.image} />
        </View>
        <StatusBar style="auto" />
      </View>
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
