import { View, Text, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { removeToken, storeToken } from '../../helper/storage';
import CustomButton from '../../components/CustomButton';
import { Redirect, router } from 'expo-router';
import * as Location from 'expo-location';
import { useGlobalContext } from '../../context/GlobalProvider';
import { sendLocationToBackend, filterPollens } from '../../lib/api'; // API pozivi ka backendu


const Home = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const izlogujMe = async () => {
    setSubmitting(true);
    await removeToken();
    setSubmitting(false);
    router.replace("/sign-in"); // Navigacija na početnu stranicu
  };

  const { user } = useGlobalContext();
  const [pollens, setPollens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dozvole', 'Dozvola za lokaciju nije odobrena');
      setIsLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let { latitude, longitude } = location.coords;

    latitude = latitude.toString();
    longitude = longitude.toString();
    try {
      // Šaljemo koordinate na backend
      console.log('pollenData pre')

      const pollenData = await sendLocationToBackend({
        latitude,
        longitude,
      });
      console.log('pollenData', pollenData)

      // Filtriramo rezultate prema korisnikovim alergenima
      // const userAllergens = user.allergens.map((a) => a.id);
      // const filteredPollens = filterPollens(pollenData, userAllergens);
      // setPollens(filteredPollens);

      // if (filteredPollens.length > 0) {
      //   Alert.alert(
      //     'Upozorenje',
      //     'U vašoj okolini su pronađeni alergeni sa visokim nivoom koncentracije!'
      //   );
      // }
    } catch (error) {
      Alert.alert('Greška', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View>
      <Text>Home</Text>
      <CustomButton
        title="IZLOGUJ ME"
        handlePress={izlogujMe}
        containerStyles="mt-7"
        isLoading={isSubmitting}
      />
      <CustomButton
        title="KOORDINATE"
        handlePress={getUserLocation}
        containerStyles="mt-7"
        isLoading={isSubmitting}
      />
      <View contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {isLoading ? (
          <Text>Učitavanje...</Text>
        ) : pollens.length > 0 ? (
          <View>
            <Text>Alergeni u vašoj okolini:</Text>
            {pollens.map((pollen) => (
              <View key={pollen.id}>
                <Text>{pollen.allergen}: {pollen.level} ({pollen.value})</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>U vašoj okolini nisu pronađeni alergeni.</Text>
        )}
      </View>
    </View>
  )
}

export default Home