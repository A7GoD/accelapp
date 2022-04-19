/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {jsonToCSV} from 'react-native-csv';
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';

import RNFS from 'react-native-fs';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Picker} from '@react-native-picker/picker';

// setUpdateIntervalForType(SensorTypes.accelerometer, 300);

const data: {x: number; y: number; z: number}[] = [];

const choices = [
  'Plain Walk',
  'Rough Walk',
  'Slope',
  'Stairs',
  'Vehicle Plain',
  'Vehicle Rough',
];

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [accelerometerData, setAccelerometerData] = React.useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [selection, setSelection] = React.useState(choices[0]);
  const [rate, setRate] = React.useState(100);

  const [isRecording, setIsRecording] = React.useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const subscription = accelerometer.subscribe(({x, y, z}) => {
    setAccelerometerData({x, y, z});
  });

  useEffect(() => {
    if (isRecording) {
      data.push(accelerometerData);
    }
  }, [isRecording, accelerometerData]);

  useEffect(() => {
    return () => {
      subscription.unsubscribe();
    };
  }, [subscription]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View>
        <Text>
          X: {accelerometerData.x}, Y: {accelerometerData.y}, Z:{' '}
          {accelerometerData.z}
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
        <Picker
          enabled={!isRecording}
          style={{width: 200}}
          selectedValue={rate}
          onValueChange={itemValue => {
            setUpdateIntervalForType(SensorTypes.accelerometer, itemValue);
            setRate(itemValue);
          }}>
          {[50, 100, 300, 500, 1000].map(item => (
            <Picker.Item
              label={'Rate: ' + item + ' ms'}
              value={item}
              key={item}
            />
          ))}
        </Picker>
        <Picker
          enabled={!isRecording}
          style={{width: 200}}
          selectedValue={selection}
          onValueChange={itemValue => setSelection(itemValue)}>
          {choices.map(item => (
            <Picker.Item label={item} value={item} key={item} />
          ))}
        </Picker>
        <TouchableOpacity
          style={{padding: 8, backgroundColor: 'coral'}}
          onPress={() => {
            if (isRecording) {
              setIsRecording(false);
              let csv = jsonToCSV(data);

              const date = new Date();

              const path =
                RNFS.DownloadDirectoryPath +
                '/' +
                selection +
                '_' +
                date.toISOString().replace(/:/g, '') +
                '.csv';
              RNFS.writeFile(path, csv, 'utf8')
                .then(_ => {
                  console.log('FILE WRITTEN!');
                })
                .catch(err => {
                  console.log(err.message);
                });

              console.log(csv);
            } else {
              data.splice(0, data.length);
              setIsRecording(true);
            }
          }}>
          <Text style={{color: 'black'}}>
            {!isRecording ? 'Start Recording' : 'Stop Recording'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;
