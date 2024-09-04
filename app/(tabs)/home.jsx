import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { removeToken, storeToken } from '../../helper/storage';
import CustomButton from '../../components/CustomButton';
import { Redirect, router } from 'expo-router';

const Home = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const izlogujMe = async () => {
    setSubmitting(true);
    await removeToken();
    setSubmitting(false);
    router.replace("/sign-in"); // Navigacija na početnu stranicu
  };
  return (
    <View>
      <Text>Home</Text>
      <CustomButton
        title="IZLOGUJ ME"
        handlePress={izlogujMe}
        containerStyles="mt-7"
        isLoading={isSubmitting}
      />
    </View>
  )
}

export default Home