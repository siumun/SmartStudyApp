import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  StyleSheet,
  Switch,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';

/**
 * InputWithLabel
 */
const InputWithLabel = (props: any) => {
  const isHorizontal = props.orientation === 'horizontal';
  return (
    <View style={[inputStyles.container, isHorizontal && inputStyles.horizontal]}>
      <Text style={inputStyles.label}>{props.label}</Text>
      <TextInput
        style={[
          inputStyles.input,
          props.editable === false && inputStyles.inputDisabled,
          props.style,
        ]}
        placeholderTextColor="#94A3B8"
        {...props}
      />
    </View>
  );
};

/**
 * AppButton
 */
const AppButton = (props: any) => {
  const themeColors: Record<string, string> = {
    success: '#16A34A',
    info: '#0284C7',
    warning: '#D97706',
    danger: '#DC2626',
    primary: '#2563EB',
  };
  const bg = themeColors[props.theme] ?? '#2563EB';

  return (
    <TouchableNativeFeedback onPress={props.onPress} onLongPress={props.onLongPress}>
      <View style={[buttonStyles.button, {backgroundColor: bg}]}>
        <Text style={buttonStyles.buttonText}>{props.title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
};

/**
 * PickerWithLabel
 */
type PickerWithLabelProps = {
  label: string;
  items: any[];
  selectedValue: string;
  onValueChange: (input: string) => void;
  orientation?: string;
};

const PickerWithLabel = (props: PickerWithLabelProps) => {
  const isHorizontal = props.orientation === 'horizontal';
  return (
    <View style={[pickerStyles.container, isHorizontal && pickerStyles.horizontal]}>
      <Text style={pickerStyles.label}>{props.label}</Text>
      <View style={pickerStyles.pickerWrapper}>
        <Picker
          style={pickerStyles.picker}
          selectedValue={props.selectedValue}
          onValueChange={props.onValueChange}>
          {props.items.map((item: any) => (
            <Picker.Item label={item.value} value={item.key} key={item.key} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    color: '#475569',
  },
});

const buttonStyles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    overflow: 'hidden',
  },
  buttonText: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
});

const pickerStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1E293B',
  },
});

/**
 * DateTimePickerWithLabel
 */
export const formatted = (inputDate: Date) => {
  const daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${daysText[inputDate.getDay()]}, ${monthsText[inputDate.getMonth()]} ${inputDate.getDate()}, ${inputDate.getFullYear()}`;
};

const DateTimePickerWithLabel = (props: any) => {
  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: props.value,
      mode: 'date',
      is24Hour: false,
      onChange: props.onChange,
    });
  };

  return (
    <View style={datePickerStyles.container}>
      <Text style={datePickerStyles.label}>DATE</Text>
      <TouchableWithoutFeedback onPress={openDatePicker}>
        <View style={datePickerStyles.inputWrapper}>
          <TextInput
            style={datePickerStyles.input}
            value={formatted(props.value)}
            editable={false}
            placeholderTextColor="#94A3B8"
            underlineColorAndroid="transparent"
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const datePickerStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    elevation: 1,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
});


const SwitchWithLabel = (props: any) => {
  return (
    <View style={switchStyles.container}>
      <Text style={switchStyles.label}>{props.label}</Text>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
      />
    </View>
  );
};

const switchStyles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export {InputWithLabel, AppButton, PickerWithLabel, DateTimePickerWithLabel, SwitchWithLabel};