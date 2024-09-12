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
import { LinearGradient } from 'expo-linear-gradient';
import { registerForPushNotificationsAsync } from '../../helper/notifications';
import * as Notifications from 'expo-notifications';


const Home = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const izlogujMe = async () => {
    setSubmitting(true);
    await removeToken();
    setSubmitting(false);
    router.replace("/sign-in"); // Navigacija na početnu stranicu
  };

  const { user, koordinate, setKoordinate } = useGlobalContext();
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

  const getFontColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'white';
      case 'normal':
        return 'black';
      case 'high':
        return 'black';
      case 'very high':
        return 'white';
      default:
        return 'white';
    }
  };


  const getGradientColors = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return ['#a8e063', '#56ab2f']; // Svetlo zelena do tamno zelena
      case 'normal':
        return ['#f6e27a', '#f2d300']; // Svetlo žuta do tamno žuta
      case 'high':
        return ['#ffcc80', '#ff7800']; // Svetlo narandžasta do tamno narandžasta
      case 'very high':
        return ['#ff4d4d', '#b30000']; // Svetlo crvena do tamno crvena (intenzivnije)
      default:
        return ['#ffffff', '#e0e0e0']; // Neutralna bela
    }
  };

  const filterPollenByLevel = (level) => {
    return pollens.filter((pollen) => pollen.level.toLowerCase() === level.toLowerCase());
  };


  const getUserLocation = async () => {
    if (koordinate) {
      console.log('moje kor', koordinate)
      setLatitude(koordinate.latitude)
      setLongitude(koordinate.longitude)

      try {
        // Šaljemo koordinate na backend
        console.log('pollenData pre')

        const pollenData = await sendLocationToBackend(koordinate);
        console.log('pollenData', pollenData)

        setPollens(pollenData);
        if (pollens.length > 0) {
          triggerNotification()
          Alert.alert(
            'Upozorenje',
            'U vašoj okolini su pronađeni alergeni sa visokim nivoom koncentracije!'
          );
        }

      } catch (error) {
        Alert.alert('Greška', error.message);
      } finally {
        setIsLoading(false);
      }
    }

  };

  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    // Registracija za push notifikacije i dobijanje tokena
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Slušaj kad stigne notifikacija dok je aplikacija aktivna
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notifikacija primljena!', notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  useEffect(() => {
    console.log('noveee', koordinate)
    if (koordinate) {
      getUserLocation();
    }
  }, []);

  const triggerNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upozorenje!',
        body: 'U vašoj okolini su pronađeni alergeni sa visokim nivoom koncentracije!',
        data: { someData: 'goes here' },
      },
      trigger: { seconds: 2 }, // Notifikacija nakon 2 sekunde
    });
  };


  // useEffect(() => {
  //   getUserLocation();
  // }, []);

  return (
    <SafeAreaView className="h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View>
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

                <View style={styles.grid}>
                  <TouchableOpacity
                    style={styles.box}
                    onPress={() => openListModal('Low')}
                  >
                    <LinearGradient
                      colors={getGradientColors('low')}
                      style={styles.box}
                    >
                      <Text style={styles.boxText}>Low: {filterPollenByLevel('Low').length}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.box}
                    onPress={() => openListModal('Normal')}
                  >
                    <LinearGradient
                      colors={getGradientColors('normal')}
                      style={styles.box}
                    >
                      <Text style={styles.boxText}>Normal: {filterPollenByLevel('Normal').length}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.box}
                    onPress={() => openListModal('High')}
                  >
                    <LinearGradient
                      colors={getGradientColors('high')}
                      style={styles.box}
                    >
                      <Text style={styles.boxText}>High: {filterPollenByLevel('High').length}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.box}
                    onPress={() => openListModal('Very High')}
                  >
                    <LinearGradient
                      colors={getGradientColors('very high')}
                      style={styles.box}
                    >
                      <Text style={styles.boxText}>Very High: {filterPollenByLevel('Very High').length}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <CustomButton
                  title="Sign off"
                  handlePress={izlogujMe}
                  containerStyles="mt-0"
                  style={styles.logOff}
                  isLoading={isSubmitting}
                />
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
                            <Text style={[styles.pollenText, { color: getFontColor(pollen.level) }]}>
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
                    <View style={styles.detailedModalContent}>
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
    height: 30,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    height: 270,
    justifyContent: 'space-between',
    paddingBottom: 20,  // Dodaj padding ispod da se osigura da se sledeći element ne preklapa
  },
  box: {
    width: '100%',  // Podesi širinu da budu 2 kutije po redu
    padding: 15,
    height: 50,
    marginBottom: 10, // Ovo će osigurati razmak između redova
    borderRadius: 10,
    alignItems: 'center',
  },
  boxText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapContainer: {
    height: 300, // Adjust the height as needed
    width: '100%',
    marginTop: 0,
  },
  map: {
    flex: 1,
  },
  logOff: {
    position: 'absolute',
    bottom: 0, // Postavlja dugme skroz dole
    left: 0,   // Postavlja dugme na levu ivicu
    right: 0,  // Postavlja dugme na desnu ivicu
    padding: 10, // Opcionalno za unutrašnje odstojanje
    backgroundColor: 'blue', // Primer boje pozadine
    alignItems: 'center', // Opcionalno za centriranje sadržaja
    justifyContent: 'center', // Opcionalno za centriranje sadržaja
    borderRadius: 10, // Opcionalno za zaobljene ivice
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tamnija pozadina za fokus na modal
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25, // Veći padding za prostraniji izgled
    borderRadius: 15, // Veće zaobljenje ivica
    width: '80%', // Povećana širina modala
    maxHeight: '70%', // Ograničavanje visine da modal ne zauzme previše prostora
    alignItems: 'center',
    shadowColor: '#000', // Dodavanje senke za moderniji izgled
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Za Android senku
  },
  pollenContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10, // Zaobljenje za svaki element
    backgroundColor: '#f7f7f7', // Svetlo siva pozadina
    shadowColor: '#000', // Mala senka ispod svakog elementa
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Senka na Androidu
  },
  pollenText: {
    color: '#333', // Tamnija nijansa za tekst
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#3498db', // Plava boja dugmeta za zatvaranje
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Pozadina sa većom prozirnošću
  },
  detailedModalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20, // Veće zaobljenje ivica za detaljni modal
    width: '80%',
    maxHeight: '60%', // Ograničena visina za bolji pregled
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 24, // Veći font za naziv alergena
    fontWeight: 'bold',
    color: '#2c3e50', // Tamnija nijansa plave
    marginBottom: 20, // Prostor ispod naslova
  },
  modalText: {
    fontSize: 18, // Veći font za opise
    color: '#34495e', // Tamno siva za tekst
    marginBottom: 10, // Prostor između redova
  },
  closeButton: {
    backgroundColor: '#e74c3c', // Crvena boja za istaknuto dugme
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Home