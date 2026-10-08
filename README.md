# Easy Breathe

The mobile app of Easy Breathe: Serbia's open pollen readings, narrowed to the allergens one
person reacts to, near where they are. React Native and Expo, on a NestJS API.

The full write-up: [vukcvetkovic.com/projects/easy-breathe](https://vukcvetkovic.com/projects/easy-breathe/)

Made for a seminar paper on e-government systems at the Faculty of Electronic Engineering in
Niš, with Đorđe Petković.

## The system

| Repository | Role |
| --- | --- |
| **easy-breathe-fe** | React Native and Expo app: the account, the map, the levels and the alerts |
| [easy-breathe-be](https://github.com/Vuk3/easy-breathe-be) | NestJS API: mirrors the open pollen data into MongoDB and answers for one user's location |

```
open pollen data  ->  easy-breathe-be  ->  MongoDB
                            ^
                            |  your location, your radius, your allergens
                            v
                      easy-breathe-fe
```

## What it does

- **An account that holds your settings.** Sign up and sign in against the API. The token is
  kept in AsyncStorage and sent as a bearer token with every call, so the same allergens and
  radius follow the account rather than the phone.
- **Your allergens.** The profile lists every allergen the open data publishes
  (`GET /allergens`) and saves the ones you pick.
- **Your location, your radius.** The app reads the phone's position with expo-location and
  sends it to the API (`PATCH /users/location`), which looks up the measuring stations within
  the radius set on the profile.
- **A map of the stations near you.** Each reading is a marker on react-native-maps, and a
  marker's callout says which allergen was measured there and how high it was.
- **Four levels, with counts.** Low, Normal, High and Very High, each a tile with the number
  of nearby readings at that level. Tap a tile for the list behind it.
- **An alert when it matters.** When readings come back for your area, the app raises a local
  notification through expo-notifications and an in-app alert, so the warning arrives
  without digging through the map.

## Structure

| Path | What is in it |
| --- | --- |
| `app/(auth)` | Sign-in and sign-up |
| `app/(tabs)` | Home, with the map and the four levels, and Profile, with your details, allergens and radius |
| `lib/api.js` | Every call to the API |
| `helper/` | Token storage and push notification setup |
| `context/GlobalProvider.js` | The signed-in user, shared across the screens |

Screens are routed by expo-router from the `app/` folder, and styled with NativeWind, Tailwind
classes in React Native.

## Running it

Node, the Expo tooling, and [easy-breathe-be](https://github.com/Vuk3/easy-breathe-be)
running.

```bash
npm install
npx expo start
```

The API address is the `url` constant at the top of `lib/api.js`. On a phone it has to be
your computer's address on the local network rather than `localhost`.
