import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { images } from '../constants'
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';
import { useEffect } from 'react';
import { sendLocationToBackend } from '../lib/api';

export default function App() {
  const { isLoading, isLogged } = useGlobalContext();
  if (!isLoading && isLogged) return <Redirect href="/home" />
  const { koordinate, setKoordinate } = useGlobalContext();


  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Dozvole', 'Dozvola za lokaciju nije odobrena');
      setIsLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location)

    const { latitude, longitude } = location.coords;
    const coordinatee = { latitude, longitude };

    setKoordinate(coordinatee);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (koordinate) {
      console.log(koordinate)
      console.log('djokica');
    }

  }, [koordinate]);


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          {/* <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          /> */}
          <Text className="text-3xl text-white font-bold text-center">EasyBreathe</Text>

          <Image
            source={images.homePicture}
            className="max-w-[380px] w-full h-[400px] rounded-[100px]"
            resizeMode="contain"
          // style={{ borderRadius: 100 }} // Postavljamo radijus zaobljenja direktno u stilovima

          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">Breathe Easy, Live Freely {' '}
              {/* <Text className="text-secondary-200">
                Aora
              </Text> */}
            </Text>
            <Image
              source={images.path}
              className="w-[150px] h-[15px] absolute -bottom-4 -right-8"
              resizeMode="contain"
            />
          </View>
          <Text className="text-sm font-prelugar text-gray-100 mt-7 text-center w-[80%]">Embrace Vitality, Explore Boundless Breath, Live Fully with EasyBreath
          </Text>
          <CustomButton
            title="Continue with email"
            handlePress={() => { router.push('/sign-in') }}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar
        backgroundColor='#161622'
        style='light'
      />
    </SafeAreaView>
  );
}
