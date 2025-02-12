import { CurrencyPicker } from '@/components/currencyPicker';
import { DayPicker } from '@/components/dayPicker/dayPicker';
import { Dayjs } from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HISTORY, TOTAL } from '@/constants/storage';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // Date state
  const [earned, setEarned] = useState('');
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<
    { date: string; amount: string; code: string; converted: string }[]
  >([]);
  const [selectedCurrency, setSelectedCurrency] = useState<{
    code: string;
    rate: number;
  }>({
    code: '',
    rate: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedTotal = await AsyncStorage.getItem(TOTAL);
        if (savedTotal) setTotal(parseFloat(savedTotal));

        const savedHistory = await AsyncStorage.getItem(HISTORY);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      };

      loadData();
    }, [])
  );

  const handleOutsidePress = () => {
    if (isDropdownVisible) {
      setDropdownVisible(false);
    }
    Keyboard.dismiss();
  };

  const handleOpenDropdown = () => {
    setDropdownVisible(true);
  };

  // Сохранение заработанного в "Всего" и Историю
  const handleApply = async () => {
    if (!earned || !selectedDate) return;

    const newTotal = total + convertedAmount;
    setTotal(newTotal);
    setEarned('');
    Keyboard.dismiss();

    const newEntry = {
      date: selectedDate.format('DD.MM.YYYY'),
      amount: earned,
      code: selectedCurrency.code,
      converted: convertedAmount.toFixed(2),
    };

    const updatedHistory = [newEntry, ...history]; // Добавляем запись в начало
    setHistory(updatedHistory);

    await AsyncStorage.setItem(TOTAL, newTotal.toString());
    await AsyncStorage.setItem(HISTORY, JSON.stringify(updatedHistory));
  };

  // Подсчет суммы в GEL
  const convertedAmount = useMemo(() => {
    const num = parseFloat(earned)
      ? parseFloat(earned) * selectedCurrency.rate
      : 0;
    return Math.ceil(num * 100) / 100;
  }, [earned, selectedCurrency.rate]);

  const btnStyles = earned
    ? styles.button
    : { ...styles.button, backgroundColor: '#aaa' };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <DayPicker
            selectedDate={selectedDate}
            onSetSelectedDate={setSelectedDate}
          />

          <CurrencyPicker
            onClose={handleOutsidePress}
            onOpen={handleOpenDropdown}
            isDropdownVisible={isDropdownVisible}
            selectedDate={selectedDate}
            onCurrencySelect={setSelectedCurrency}
            selectedCurrency={selectedCurrency}
          />
        </View>

        <View style={styles.inputs}>
          {/* Поле "Всего" */}
          <Text style={styles.label}>Всего:</Text>
          <Text style={styles.total}>{total.toFixed(2)} Лари</Text>

          {/* Поле "Заработал" */}
          <Text style={styles.label}>Заработал:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={earned}
            onChangeText={setEarned}
            placeholder="Введите сумму"
          />

          {/* Конвертированная сумма */}
          {earned !== '' && (
            <Text style={styles.convertedAmount}>
              {convertedAmount.toFixed(2)} Лари
            </Text>
          )}

          {/* Кнопка "Применить" */}
          <TouchableOpacity
            style={btnStyles}
            onPress={handleApply}
            disabled={!earned}
          >
            <Text style={styles.buttonText}>Применить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 60,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  inputs: {
    flex: 1,
    backgroundColor: '#222',
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 36,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
  },
  convertedAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
