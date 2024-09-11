import { View, Text, ScrollView, Alert, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { removeToken, storeToken } from '../../helper/storage';
import CustomButton from '../../components/CustomButton';
import { Redirect, router } from 'expo-router';
import * as Location from 'expo-location';
import { useGlobalContext } from '../../context/GlobalProvider';
import { sendLocationToBackend, filterPollens } from '../../lib/api'; // API pozivi ka backendu
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker } from 'react-native-maps';


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

  const [latitude, setLatitude] = useState([]);
  const [longitude, setLongitude] = useState([]);


  const [modalVisible, setModalVisible] = useState(false);
  const [detailedModalVisible, setDetailedModalVisible] = useState(false);
  const [selectedPollen, setSelectedPollen] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState('');

  const openListModal = (level) => {
    setSelectedLevel(level);
    setModalVisible(true);
  };

  const openDetailedModal = (pollen) => {
    setSelectedPollen(pollen);
    setDetailedModalVisible(true);
  };

  const getBackgroundColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'green';
      case 'normal':
        return 'yellow';
      case 'high':
        return 'orange';
      case 'very high':
        return 'red';
      default:
        return 'white';
    }
  };

  const filterPollenByLevel = (level) => {
    return pollens.filter((pollen) => pollen.level.toLowerCase() === level.toLowerCase());
  };


  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dozvole', 'Dozvola za lokaciju nije odobrena');
      setIsLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let { latitude, longitude } = location.coords;

    setLatitude(latitude.toString());
    setLongitude(longitude.toString());
    try {
      // Šaljemo koordinate na backend
      console.log('pollenData pre')

      const pollenData = await sendLocationToBackend({
        latitude,
        longitude,
      });
      console.log('pollenData', pollenData)

      setPollens(pollenData);
      if (pollens.length > 0) {
        // Alert.alert(
        //   'Upozorenje',
        //   'U vašoj okolini su pronađeni alergeni sa visokim nivoom koncentracije!'
        // );
      }

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
    <SafeAreaView className="h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View>
          <Text>Home</Text>
          <CustomButton
            title="IZLOGUJ ME"
            handlePress={izlogujMe}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          {/* <CustomButton
            title="KOORDINATE"
            handlePress={getUserLocation}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          /> */}
          <View contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {isLoading ? (
              <Text>Učitavanje...</Text>
            ) : pollens.length > 0 ? (
              <View style={styles.container}>
                <Text style={styles.header}>Alergeni u Vašoj okolini</Text>

                {/* Klik na ovaj view otvara listu alergena */}
                <View style={styles.grid}>
                  <TouchableOpacity
                    style={[styles.box, { backgroundColor: 'green' }]}
                    onPress={() => openListModal('Low')}
                  >
                    <Text style={styles.boxText}>Low: {filterPollenByLevel('Low').length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.box, { backgroundColor: 'yellow' }]}
                    onPress={() => openListModal('Normal')}
                  >
                    <Text style={styles.boxText}>Normal: {filterPollenByLevel('Normal').length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.box, { backgroundColor: 'orange' }]}
                    onPress={() => openListModal('High')}
                  >
                    <Text style={styles.boxText}>High: {filterPollenByLevel('High').length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.box, { backgroundColor: 'red' }]}
                    onPress={() => openListModal('Very High')}
                  >
                    <Text style={styles.boxText}>Very High: {filterPollenByLevel('Very High').length}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude, // Trenutna lokacija korisnika
                      longitude,
                      latitudeDelta: 0.5,
                      longitudeDelta: 0.5,
                    }}
                    pinColor="blue" // Boja za marker tvoje lokacije
                    title="Your Location"
                  >
                    {/* Grupiši polene po lokaciji */}
                    {Object.values(
                      pollens.reduce((acc, pollen) => {
                        const key = `${pollen.location.latitude},${pollen.location.longitude}`;
                        if (!acc[key]) {
                          acc[key] = {
                            ...pollen.location,
                            allergens: [],
                          };
                        }
                        acc[key].allergens.push(pollen);
                        console.log('acc je', acc)
                        return acc;
                      }, {})
                    ).map((location, index) => (
                      <Marker
                        key={index}
                        coordinate={{
                          latitude: parseFloat(location.latitude),
                          longitude: parseFloat(location.longitude),
                        }}
                        pinColor={getBackgroundColor(location.allergens[0].level)} // Boja na osnovu prvog alergena
                        title={location.name}
                      >
                        <Callout>
                          <Text>
                            {location.allergens
                              .map(
                                (allergen) =>
                                  `${allergen.allergen.localized_name}: ${allergen.level} concentration`
                              )
                              .join('\n')} {/* Ovo sada podržava višelinijski prikaz */}
                          </Text>
                        </Callout>
                      </Marker>
                    ))}
                  </MapView>
                </View>

                {/* Modal za listu alergena */}
                <Modal visible={modalVisible} transparent={true} animationType="slide">
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <ScrollView>
                        {filterPollenByLevel(selectedLevel).map((pollen) => (
                          <TouchableOpacity
                            key={pollen.id}
                            style={[styles.pollenContainer, { backgroundColor: getBackgroundColor(pollen.level) }]}
                            onPress={() => {
                              setModalVisible(false);
                              openDetailedModal(pollen);
                            }}
                          >
                            <Text style={styles.pollenText}>
                              {pollen.allergen.localized_name} - {pollen.location.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.closeButtonText}>Zatvori</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {/* Modal za detalje pojedinačnog alergena */}
                <Modal visible={detailedModalVisible} transparent={true} animationType="slide">
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      {selectedPollen && (
                        <>
                          <Text style={styles.modalHeader}>
                            {selectedPollen.allergen.localized_name}
                          </Text>
                          <Text style={styles.modalText}>
                            Lokacija: {selectedPollen.location.name}
                          </Text>
                          <Text style={styles.modalText}>
                            Opis: {selectedPollen.location.description}
                          </Text>
                          <Text style={styles.modalText}>
                            Nivo: {selectedPollen.level}
                          </Text>

                          <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setDetailedModalVisible(false)}
                          >
                            <Text style={styles.closeButtonText}>Zatvori</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </Modal>

              </View>
            ) : (
              <Text>U vašoj okolini nisu pronađeni alergeni.</Text>
            )}
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    height: 20,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: '100%', // Adjust the width to fit two boxes per row
    padding: 10,
    height: 50,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  boxText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  pollenContainer: {
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pollenText: {
    color: 'black',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300, // Adjust the height as needed
    width: '100%',
    marginTop: 250,
  },
  map: {
    flex: 1,
  }
});

export default Home