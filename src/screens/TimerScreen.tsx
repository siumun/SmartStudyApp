import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import db from '../database/db';

const TimerScreen = ({route, navigation}: any) => {

  const {taskId} = route.params;

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // pause &resume
  const togglePause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  // End task
  const endTask = () => {
  clearInterval(intervalRef.current);
  const finalDuration = seconds;

  db.transaction(
    (tx: any) => {
      tx.executeSql(
        'UPDATE sessions SET duration = ? WHERE task_id = ?',
        [finalDuration, taskId],
        // @ts-ignore
        (_, result) => console.log('Session saved, rows affected:', result.rowsAffected),
        // @ts-ignore
        (_, err) => { console.log('SESSION ERROR:', err); return true; }
      );

      tx.executeSql(
        'UPDATE tasks SET status = ? WHERE id = ?',
        ['done', taskId],
        // @ts-ignore
        (_, result) => console.log('Task marked done, rows affected:', result.rowsAffected),
        // @ts-ignore
        (_, err) => { console.log('UPDATE ERROR:', err); return true; }
      );
    },
    (err: any) => console.log('TRANSACTION ERROR:', err),
    () => navigation.popToTop()
  );
};

  //Time format
  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F4F6FB',
    }}>

      {/* Timer*/}
      <Text style={{fontSize: 40, fontWeight: 'bold'}}>
        {formatTime()}
      </Text>

      {/* Pause & Resume*/}
      <TouchableOpacity
        onPress={togglePause}
        style={{
          marginTop: 30,
          backgroundColor: '#FFC107',
          padding: 15,
          borderRadius: 10,
          width: 180,
        }}
      >
        <Text style={{textAlign: 'center'}}>
          {isRunning ? 'Pause' : 'Resume'}
        </Text>
      </TouchableOpacity>

      {/* End Task */}
      <TouchableOpacity
        onPress={endTask}
        style={{
          marginTop: 15,
          backgroundColor: '#F44336',
          padding: 15,
          borderRadius: 10,
          width: 180,
        }}
      >
        <Text style={{textAlign: 'center', color: '#fff'}}>
          End Task
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default TimerScreen;