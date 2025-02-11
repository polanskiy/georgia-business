import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs, { Dayjs } from 'dayjs'; // Import dayjs

import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { DATE } from '@/constants/storage';

interface IProps {
  selectedDate: Dayjs | null;
  onSetSelectedDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
}

export const DayPicker = ({ onSetSelectedDate, selectedDate }: IProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] =
    useState<boolean>(false);

  useEffect(() => {
    const loadSavedDate = async () => {
      const savedDate = await AsyncStorage.getItem(DATE);
      if (savedDate) {
        onSetSelectedDate(dayjs(savedDate)); // Set the saved date if it exists
      }
    };

    loadSavedDate();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Close the date picker modal
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Handle the date selection and save it
  const handleConfirm = async (date: Date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD'); // Save date in a standard format
    onSetSelectedDate(dayjs(date)); // Update the state with selected date
    await AsyncStorage.setItem(DATE, formattedDate); // Save date to AsyncStorage
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={showDatePicker}>
        <Text style={styles.buttonText}>
          {selectedDate ? selectedDate.format('DD.MM.YYYY') : 'Выберите дату'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date" // Show date mode only
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={selectedDate?.toDate() || new Date()} // Set the initial date to the selected date or today
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
