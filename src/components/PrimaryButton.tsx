
import React from 'react';
import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native';

const PrimaryButton = ({ title, onPress, style }: any) => {
  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={[styles.button, style]}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 30,
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',  
  },
  text: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default PrimaryButton;