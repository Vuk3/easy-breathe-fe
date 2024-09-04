import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, TouchableOpacity, Image, Modal } from 'react-native';
import SelectBox from 'react-native-multi-selectbox';
import { xorBy } from 'lodash';
import { useGlobalContext } from '../../context/GlobalProvider';

import { icons } from '../../constants';
import { updateObject, getAllergens, createUser } from '../../lib/api';
import CustomButton from '../../components/CustomButton';


const ProfileScreen = () => {
  const { user, setUser } = useGlobalContext();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isEditModalSettingsVisible, setEditModalSettingsVisible] = useState(false);



  const [firstName, setFirstName] = useState(user.name);
  const [lastName, setLastName] = useState(user.name);
  const [userName, setUserName] = useState(user.username);

  const [tempFirstName, setTempFirstName] = useState(user.firstName);
  const [tempLastName, setTempLastName] = useState(user.lastName);

  const [frequency, setFrequency] = useState(user.notificationFrequency);
  const [radius, setRadius] = useState(user.radius);

  const [tempFrequency, setTempFrequency] = useState(user.notificationFrequency);
  const [tempRadius, setTempRadius] = useState(user.radius);

  console.log('rwerwerwerwe', user.allergens);
  const [allergens, setAllergens] = useState(user.allergens)
  const [selectedAllergens, setSelectedAllergens] = useState(user.allergens);

  const [isSubmitting, setSubmitting] = useState(false);

  const submitAllergens = async () => {
    setSubmitting(true);
    try {
      const result = await updateObject({ allergens: selectedAllergens })
      setUser(result)

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = () => {
    setTempFirstName(firstName); // Kopira trenutni lastName u tempLastName
    setTempLastName(lastName); // Kopira trenutni lastName u tempLastName

    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const saveChanges = () => {
    setFirstName(tempFirstName);
    setLastName(tempLastName);

    const updatedUser = {
      name: tempFirstName, // Ažuriraj firstName
      // lastName: tempLastName, // Ažuriraj lastName
    };

    updateObject(updatedUser).then((res) => {
      setUser(res);
    })
    closeEditModal();
  };

  const openEditModalSettings = () => {
    setTempFrequency(frequency); // Kopira trenutni lastName u tempLastName
    setTempRadius(radius); // Kopira trenutni lastName u tempLastName

    setEditModalSettingsVisible(true);
  };

  const closeEditModalSettings = () => {
    setEditModalSettingsVisible(false);
  };

  const saveChangesSettings = () => {
    setFrequency(tempFrequency);
    setRadius(tempRadius);

    const updatedUser = {
      notificationFrequency: tempFrequency, // Ažuriraj firstName
      radius: tempRadius, // Ažuriraj firstName
      // lastName: tempLastName, // Ažuriraj lastName
    };

    updateObject(updatedUser).then((res) => {
      setUser(res);
    })
    closeEditModalSettings();
  };

  useEffect(() => {
    console.log('weqewqweweqewq')

    getAllergens().then((res) => {
      const options = res.map((allergen) => {
        return { item: allergen.name, id: allergen._id }
      })
      setAllergens(options)
    });
  }, []);

  const onMultiChange = () => {
    return (item) => setSelectedAllergens(xorBy(selectedAllergens, [item], 'id'));
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <View className="bg-secondary flex-row justify-between w-full py-4 px-6 rounded-lg mb-3">
            <Text className="text-white text-2xl font-bold">Dobrodošli, {userName}!</Text>
            <Image
              source={icons.profile}
              className="h-[30px] w-[30px]"
            />
          </View>
          {/* Osnovne informacije */}
          <View className="w-full bg-white p-4 rounded-lg shadow-md mb-4">
            <Text className="text-lg font-bold mb-2">Osnovne informacije</Text>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base">Ime: {firstName}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base">Prezime: {lastName}</Text>
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={openEditModal}>
                {/* <Ionicons name="md-pencil" size={24} color="black" /> */}
                <Image
                  source={icons.eye}
                />
              </TouchableOpacity>
            </View>


            {/* Modal za izmenu podataka */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isEditModalVisible}
              onRequestClose={closeEditModal}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="w-3/4 bg-white p-4 rounded-lg shadow-md">
                  <Text className="text-lg font-bold mb-2">Izmeni informacije</Text>
                  <TextInput
                    className="bg-gray-200 p-2 rounded-md mb-2"
                    placeholder="Ime"
                    value={tempFirstName}
                    onChangeText={setTempFirstName}
                  />
                  <TextInput
                    className="bg-gray-200 p-2 rounded-md mb-2"
                    placeholder="Prezime"
                    value={tempLastName}
                    onChangeText={setTempLastName}
                  />
                  <Button title="Sačuvaj promene" onPress={saveChanges} />
                  <Button title="Otkaži" onPress={closeEditModal} color="red" />
                </View>
              </View>
            </Modal>
          </View>

          {/* Multi-select za alergene */}
          <View className="w-full bg-white p-4 rounded-lg shadow-md mb-4">
            <Text className="text-lg font-bold mb-2">Alergeni</Text>
            <SelectBox
              label="Select multiple"
              options={allergens}
              selectedValues={selectedAllergens}
              onMultiSelect={onMultiChange()}
              onTapClose={onMultiChange()}
              isMulti
            />
            <CustomButton
              title="Save"
              handlePress={submitAllergens}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />
          </View>






          <View className="w-full bg-white p-4 rounded-lg shadow-md mb-4">
            <Text className="text-lg font-bold mb-2">Podešavanja</Text>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base mb-2">Frekvencija provere (u satima): {frequency}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base mb-2">Radijus pretrage (u km): {radius}</Text>
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={openEditModalSettings}>
                {/* <Ionicons name="md-pencil" size={24} color="black" /> */}
                <Image
                  source={icons.eye}
                />
              </TouchableOpacity>
            </View>


            {/* Modal za izmenu podataka */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isEditModalSettingsVisible}
              onRequestClose={closeEditModalSettings}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="w-3/4 bg-white p-4 rounded-lg shadow-md">
                  <Text className="text-lg font-bold mb-2">Izmeni informacije</Text>
                  <TextInput
                    className="bg-gray-200 p-2 rounded-md mb-2"
                    placeholder="Frekvencija provere (u satima):"
                    value={tempFrequency}
                    onChangeText={setTempFrequency}
                  />
                  <TextInput
                    className="bg-gray-200 p-2 rounded-md mb-2"
                    placeholder="Radijus pretrage (u km):"
                    value={tempRadius}
                    onChangeText={setTempRadius}
                  />
                  <Button title="Sačuvaj promene" onPress={saveChangesSettings} />
                  <Button title="Otkaži" onPress={closeEditModalSettings} color="red" />
                </View>
              </View>
            </Modal>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;