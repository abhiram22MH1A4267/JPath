// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Fragment } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
//npm install react-native-gesture-handler
import 'react-native-gesture-handler';
import JobPage from './Screens/JobPage';
import { LogBox } from 'react-native';
import StackNavigation from './Screens/StackNavigations/StackNavigation';

export default function App() {
LogBox.ignoreAllLogs();

  return (
    // <SafeAreaView style={styles.container}>
    //   <StackNavigation />
    // </SafeAreaView>
    // <>
    // {/* <StatusBar style='auto' backgroundColor="#000" /> */}
    // {/* <SafeAreaProvider style={{flex:1}}> */}
      <Fragment style={{flex:1}} >
        <JobPage/>
      </Fragment>
  //  {/*  </SafeAreaProvider> */}
  //  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
