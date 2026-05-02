import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
} from 'react-native';
import db from '../database/db';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';


const StartNowScreen = ({navigation, route}: any) => {

  const [title, setTitle] = useState('');
  const currentDate = new Date();

  const _create = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter title', ToastAndroid.SHORT);
      
      return;
    }

    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT INTO tasks (title, date, status) VALUES (?, ?, ?)',
        [title, currentDate.getTime(), 'planned'],
        (_: any, results: any) => {
          if (results.rowsAffected > 0) {
            const taskId = results.insertId;
            navigation.replace('Location', { taskId });
          }
        },
        (err: any) => console.log('INSERT ERROR:', err),
      );
    });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F4F6FB', padding: 16}}>
      <Header navigation={navigation} />

      <Text style={{fontWeight: 'bold'}}>Task Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
        style={{backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 10}}
      />

      <Text style={{marginTop: 20, fontWeight: 'bold'}}>Date</Text>
      <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 10}}>
        <Text>{currentDate.toDateString()}</Text>
      </View>

      <PrimaryButton 
      title="Next"
      onPress={_create}
      />
    </View>
  );
};

export default StartNowScreen;
