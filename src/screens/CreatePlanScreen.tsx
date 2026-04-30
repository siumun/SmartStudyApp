import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableNativeFeedback,
  TouchableOpacity, Modal, ScrollView,
  ToastAndroid, StyleSheet,
} from 'react-native';
import db from '../database/db';

const CreateScreen = ({navigation, route}: any) => {

  const [newDate, setNewDate] = useState(new Date());

  useEffect(() => {
    setTempYear(newDate.getFullYear());
    setTempMonth(newDate.getMonth());
    setTempDay(newDate.getDate());
  }, [newDate]);

  const [newtitle, setTitle] = useState('');
  const [newdate, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [tempYear, setTempYear] = useState(newdate.getFullYear());
  const [tempMonth, setTempMonth] = useState(newdate.getMonth());
  const [tempDay, setTempDay] = useState(newdate.getDate());

  const years = Array.from({length: 11}, (_, i) => 2020 + i);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = Array.from({length: 31}, (_, i) => i + 1);

  const confirmDate = () => {
    setDate(new Date(tempYear, tempMonth, tempDay));
    setShowPicker(false);
  };

  const _create = () => {
    if (!newtitle.trim()) {
      ToastAndroid.showWithGravity('Please enter title', ToastAndroid.SHORT, ToastAndroid.TOP);
      return;
    }

    // ✅ Must use db.transaction()
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT INTO tasks (title, date, status) VALUES (?, ?, ?)',
        [newtitle, newdate.getTime(), 'planned'],
        (_: any, results: any) => {
          if (results.rowsAffected > 0) {
            ToastAndroid.showWithGravity('Plan created successfully', ToastAndroid.SHORT, ToastAndroid.TOP);
            route?.params?.refresh?.();
            setTimeout(() => navigation.goBack(), 1000);
          }
        },
        (err: any) => {
          console.log('INSERT ERROR:', err);
          ToastAndroid.showWithGravity('Failed to create plan', ToastAndroid.SHORT, ToastAndroid.TOP);
        },
      );
    });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F4F6FB', paddingTop: 12}}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={{margin: 16}}>
        <Text style={{fontWeight: 'bold', marginBottom: 5, color: '#000'}}>Plan Title</Text>
        <TextInput
          value={newtitle}
          onChangeText={setTitle}
          placeholder="Enter plan title"
          style={{backgroundColor: '#fff', padding: 12, borderRadius: 10, color: '#000'}}
        />
      </View>

      <View style={{margin: 16}}>
        <Text style={{fontWeight: 'bold', marginBottom: 5, color: '#000'}}>Date</Text>
        <TouchableOpacity
          onPress={() => {
            setTempYear(newdate.getFullYear());
            setTempMonth(newdate.getMonth());
            setTempDay(newdate.getDate());
            setShowPicker(true);
          }}
          style={{backgroundColor: '#fff', padding: 12, borderRadius: 10}}
        >
          <Text style={{color: '#000'}}>{newdate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <View style={{backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 12, color: '#000'}}>
              Select Date
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 4}}>Day</Text>
                <ScrollView style={{height: 150}} showsVerticalScrollIndicator={false}>
                  {days.map(d => (
                    <TouchableOpacity key={d} onPress={() => setTempDay(d)}
                      style={{padding: 8, alignItems: 'center', backgroundColor: tempDay === d ? '#4CAF50' : 'transparent', borderRadius: 8, marginVertical: 2}}>
                      <Text style={{color: tempDay === d ? '#fff' : '#000'}}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 4}}>Month</Text>
                <ScrollView style={{height: 150}} showsVerticalScrollIndicator={false}>
                  {months.map((m, i) => (
                    <TouchableOpacity key={m} onPress={() => setTempMonth(i)}
                      style={{padding: 8, alignItems: 'center', backgroundColor: tempMonth === i ? '#4CAF50' : 'transparent', borderRadius: 8, marginVertical: 2}}>
                      <Text style={{color: tempMonth === i ? '#fff' : '#000'}}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 4}}>Year</Text>
                <ScrollView style={{height: 150}} showsVerticalScrollIndicator={false}>
                  {years.map(y => (
                    <TouchableOpacity key={y} onPress={() => setTempYear(y)}
                      style={{padding: 8, alignItems: 'center', backgroundColor: tempYear === y ? '#4CAF50' : 'transparent', borderRadius: 8, marginVertical: 2}}>
                      <Text style={{color: tempYear === y ? '#fff' : '#000'}}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{flexDirection: 'row', marginTop: 16, gap: 10}}>
              <TouchableOpacity onPress={() => setShowPicker(false)}
                style={{flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center'}}>
                <Text style={{color: '#000', fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate}
                style={{flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center'}}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableNativeFeedback onPress={_create}>
        <View style={{margin: 16, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center'}}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Save Plan</Text>
        </View>
      </TouchableNativeFeedback>

    </View>
  );
};

export default CreateScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 56, paddingBottom: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EBEBEA', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#1A1A1A', lineHeight: 28 },
  editButton: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 10, backgroundColor: '#1A1A1A',
  },
  editLabel: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: 0.3 },
});