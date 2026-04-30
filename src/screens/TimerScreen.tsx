import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import db from '../database/db';

const TimerScreen = ({route, navigation}: any) => {

  const {taskId} = route.params;

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef<any>(null);

  // TIMER
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // PAUSE / RESUME
  const togglePause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  // END TASK
  const endTask = () => {
    clearInterval(intervalRef.current);

    const finalDuration = seconds;

    // ✅ Must use db.transaction() for react-native-sqlite-storage
    db.transaction((tx: any) => {

      // Save session with duration
      tx.executeSql(
        'INSERT OR REPLACE INTO sessions (task_id, duration) VALUES (?, ?)',
        [taskId, finalDuration],
        () => console.log('Session saved:', finalDuration),
        (err: any) => console.log('SESSION ERROR:', err),
      );

      // Update task status to done
      tx.executeSql(
        'UPDATE tasks SET status = ? WHERE id = ?',
        ['done', taskId],
        () => console.log('Task marked done'),
        (err: any) => console.log('UPDATE ERROR:', err),
      );

    },
    (err: any) => console.log('TRANSACTION ERROR:', err),
    () => navigation.popToTop(), // ✅ Navigate only after both SQLs succeed
    );
  };

  // FORMAT TIME
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

      {/* TIMER */}
      <Text style={{fontSize: 40, fontWeight: 'bold'}}>
        {formatTime()}
      </Text>

      {/* PAUSE / RESUME */}
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

      {/* END TASK */}
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