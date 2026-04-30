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
            navigation.replace('Timer', { taskId });
          }
        },
        (err: any) => console.log('INSERT ERROR:', err),
      );
    });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F4F6FB', padding: 16}}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

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

      <TouchableNativeFeedback onPress={_create}>
        <View style={{marginTop: 30, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10}}>
          <Text style={{color: '#fff', textAlign: 'center'}}>Start Now</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

export default StartNowScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EBEBEA',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#1A1A1A', lineHeight: 28 },
  editButton: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 10, backgroundColor: '#1A1A1A',
  },
  editLabel: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: 0.3 },
});