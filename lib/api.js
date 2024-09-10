import axios from 'axios';
import { getToken, storeToken } from '../helper/storage';

const url = "http://192.168.0.14:3000";
// const url = "https://1d83-178-149-147-25.ngrok-free.app";


export const createUser = async (email, password, username) => {
  try {

    const formData = {
      username,
      email,
      password,
      date_of_birth: new Date(),
      name: "bilosta"
    };
    // Napravite POST zahtev sa Axios-om
    const response = await axios.post(url + '/users', formData);
    console.log('Uspešno poslat POST zahtev:', response.data);

    // await signIn(email, password);
  } catch (error) {
    throw new Error(error)
  }
}

export const signIn = async (email, password) => {
  try {

    const formData = {
      email,
      password,
    };
    // Napravite POST zahtev sa Axios-om
    //ovde treba neka sesija da se doda
    const response = await axios.post(url + '/users/login', formData);
    console.log('Uspešno poslat POST zahtev za login:', response.data);

    return response.data;
  } catch (error) {
    throw new Error(error)
  }
}

export const getMe = async (token) => {
  try {
    const response = await axios.get(url + '/users/me', {
      //example with bearer token
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    throw new Error(error)
  }
}

export const updateObject = async (objectToUpdate) => {
  try {
    var token = await getToken();
    const response = await axios.patch(url + '/users', objectToUpdate, {
      //example with bearer token
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    throw new Error(error)
  }
}

export const getAllergens = async () => {
  try {
    var token = await getToken();
    const response = await axios.get(url + '/allergens', {
      //example with bearer token
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    throw new Error(error)
  }
}

export const sendLocationToBackend = async (coordinates) => {
  try {
    console.log('ovo je coordinates', coordinates)
    var token = await getToken();
    const response = await axios.patch(url + '/users/location', coordinates, {
      //example with bearer token
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('ovo je response.data', response.data)

    return response.data;

  } catch (error) {
    throw new Error(error)
  }
}
export const getCurrentUser = async () => {
  try {
    return await getToken();
  } catch (error) {

  }
}