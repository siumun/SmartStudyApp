import React, {useEffect, useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, ToastAndroid, StyleSheet,
} from 'react-native';
import db from '../database/db';
import Header from '../components/Header';

const EditScreen = ({navigation, route}: any) => {

  const [title, setTitle] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date();
  const [tempYear, setTempYear] = useState(today.getFullYear());
  const [tempMonth, setTempMonth] = useState(today.getMonth());
  const [tempDay, setTempDay] = useState(today.getDate());

  const years = Array.from({length: 11}, (_, i) => 2020 + i);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = Array.from({length: 31}, (_, i) => i + 1);

  const _load = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT * FROM tasks WHERE id = ?',
        [route.params.id],
        (_: any, results: any) => {
          const item = results.rows.item(0);
          if (item) {
            setTitle(item.title);
            const d = new Date(Number(item.date));
            setTempYear(d.getFullYear());
            setTempMonth(d.getMonth());
            setTempDay(d.getDate());
          }
        },
        (err: any) => {
          console.log('LOAD ERROR:', err);
          return true;
        },
      );
    });
  };

  useEffect(() => {
    _load();
  }, []);

  const confirmDate = () => {
    setShowPicker(false);
  };

  const _update = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter title', ToastAndroid.SHORT);
      return;
    }

    const finalDate = new Date(tempYear, tempMonth, tempDay);

    db.transaction((tx: any) => {
      tx.executeSql(
        'UPDATE tasks SET title = ?, date = ? WHERE id = ?',
        [title, finalDate.getTime(), route.params.id],
        (_: any, results: any) => {
          if (results.rowsAffected > 0) {
            ToastAndroid.show('Updated successfully', ToastAndroid.SHORT);
            if (route?.params?.refresh) {
              route.params.refresh();
            }
            navigation.goBack();
          }
        },
        (err: any) => {
          console.log('UPDATE ERROR:', err);
          return true;
        },
      );
    });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F4F6FB', paddingTop: 12}}>

      <Header navigation={navigation} />

      <View style={{margin: 16}}>
        <Text style={{fontWeight: 'bold', marginBottom: 5}}>Plan Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter plan title"
          style={{backgroundColor: '#fff', padding: 12, borderRadius: 10}}
        />
      </View>

      <View style={{margin: 16}}>
        <Text style={{fontWeight: 'bold', marginBottom: 5}}>Date</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{backgroundColor: '#fff', padding: 12, borderRadius: 10}}
        >
          <Text>{new Date(tempYear, tempMonth, tempDay).toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <View style={{backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16}}>

            <Text style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 12}}>
              Select Date
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

              <ScrollView style={{height: 150, flex: 1}}>
                {days.map(d => (
                  <TouchableOpacity key={d} onPress={() => setTempDay(d)}>
                    <Text style={{
                      padding: 8, textAlign: 'center', borderRadius: 8, marginVertical: 2,
                      backgroundColor: tempDay === d ? '#4CAF50' : 'transparent',
                      color: tempDay === d ? '#fff' : '#000',
                    }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={{height: 150, flex: 1}}>
                {months.map((m, i) => (
                  <TouchableOpacity key={m} onPress={() => setTempMonth(i)}>
                    <Text style={{
                      padding: 8, textAlign: 'center', borderRadius: 8, marginVertical: 2,
                      backgroundColor: tempMonth === i ? '#4CAF50' : 'transparent',
                      color: tempMonth === i ? '#fff' : '#000',
                    }}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={{height: 150, flex: 1}}>
                {years.map(y => (
                  <TouchableOpacity key={y} onPress={() => setTempYear(y)}>
                    <Text style={{
                      padding: 8, textAlign: 'center', borderRadius: 8, marginVertical: 2,
                      backgroundColor: tempYear === y ? '#4CAF50' : 'transparent',
                      color: tempYear === y ? '#fff' : '#000',
                    }}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

            </View>

            <View style={{flexDirection: 'row', marginTop: 16, gap: 10}}>
              <TouchableOpacity onPress={() => setShowPicker(false)}
                style={{flex: 1, padding: 12, backgroundColor: '#eee', borderRadius: 10}}>
                <Text style={{textAlign: 'center'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate}
                style={{flex: 1, padding: 12, backgroundColor: '#4CAF50', borderRadius: 10}}>
                <Text style={{textAlign: 'center', color: '#fff'}}>Confirm</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={_update}
        style={{margin: 16, backgroundColor: '#000000', padding: 15, borderRadius: 10}}
      >
        <Text style={{color: '#fff', textAlign: 'center'}}>Update Plan</Text>
      </TouchableOpacity>

    </View>
  );
};

export default EditScreen;
