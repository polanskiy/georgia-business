import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dayjs } from 'dayjs';
import { BANK_API_URL } from '@/constants/api';
import { CURRENCY } from '@/constants/storage';
import { TCurrencyModel } from './types';

interface IProps {
  isDropdownVisible: boolean;
  onClose: () => void;
  onOpen: () => void;
  selectedDate: Dayjs | null;
  selectedCurrency: {
    code: string;
    rate: number;
  };
  onCurrencySelect: React.Dispatch<
    React.SetStateAction<{
      code: string;
      rate: number;
    }>
  >;
}

export const CurrencyPicker = ({
  onClose,
  onOpen,
  isDropdownVisible,
  selectedDate,
  selectedCurrency,
  onCurrencySelect,
}: IProps) => {
  const [data, setData] = useState<TCurrencyModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<View>(null);

  useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency = await AsyncStorage.getItem(CURRENCY);
      if (savedCurrency) onCurrencySelect(JSON.parse(savedCurrency));
    };
    loadCurrency();
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [selectedDate]);

  const fetchCurrencies = async () => {
    try {
      const dateParam = selectedDate ? selectedDate.format('YYYY-MM-DD') : ''; // Convert to 'YYYY-MM-DD' format
      const url = `${BANK_API_URL}?date=${dateParam}`;
      const response = await fetch(url);
      const json = await response.json();
      const firstUSDandEUR = json[0].currencies.filter(
        (currency: any) => currency.code === 'USD' || currency.code === 'EUR'
      );
      const finalList: TCurrencyModel[] = firstUSDandEUR.concat(
        json[0].currencies.filter(
          (currency: any) => currency.code !== 'USD' && currency.code !== 'EUR'
        )
      );
      setData(finalList || []);

      if (selectedCurrency.code) {
        const newData = finalList.find(
          (item) => item.code === selectedCurrency.code
        );
        if (!newData) return;
        onCurrencySelect(newData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCurrency = async (currency: string) => {
    const selected = data.find((item) => item.code === currency);
    if (!selected) return;

    onCurrencySelect({ code: selected.code, rate: selected.rate });
    await AsyncStorage.setItem(CURRENCY, JSON.stringify(selected));
    onClose();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onOpen}>
        <Text style={styles.buttonText}>
          {selectedCurrency
            ? `Выбрано: ${selectedCurrency.code}`
            : 'Выберите валюту'}
        </Text>
      </TouchableOpacity>

      {isDropdownVisible && (
        <>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : data.length === 0 ? (
            <Text>Нет данных для отображения</Text>
          ) : (
            <View style={styles.dropdown} ref={dropdownRef}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => selectCurrency(item.code)}
                  >
                    <View style={styles.card}>
                      <Text style={styles.currency}>{item.code}</Text>
                      <Text style={styles.rate}>{item.rate} GEL</Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.list}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // marginTop: 20,
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 50, // Расстояние от кнопки
    width: 170, // Совпадает с шириной кнопки
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 100,
    maxHeight: 350, // Ограничиваем высоту списка
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  list: {
    maxHeight: 350, // Ограничение высоты списка
  },
  item: {
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rate: {
    fontSize: 16,
    color: '#555',
  },
});

export default CurrencyPicker;
