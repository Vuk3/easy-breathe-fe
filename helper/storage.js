import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('@user_token', token);
  } catch (error) {
    console.error('Error storing the token', error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@user_token');
    return token;
  } catch (error) {
    console.error('Error getting the token', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@user_token');
  } catch (error) {
    console.error('Error storing the token', error);
  }
};
