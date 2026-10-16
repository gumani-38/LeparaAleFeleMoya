# Welcome to your Expo app 👋

## API configuration

The API client is in [`src/lib/api.ts`](./src/lib/api.ts) and uses
`https://lepara-api.onrender.com/api/v1/`. Its route paths match the backend's
public product catalog and categories, customer authentication, profile,
donation pledge, volunteer application, and order endpoints. The home and shop
screens load product names, prices, categories, sizes, stock, and images from
the public products endpoint. Authentication, profile/security, donation,
volunteer, and order requests also use this shared client.

The API should return JSON. Login and OTP verification responses may return an
access token as `accessToken`, `access_token`, or `token`, either at the top
level or under `data`. Native devices store the token with Expo SecureStore;
web sessions remain in memory. Card details are intentionally not collected
or sent by the app; card payment must be completed by a secure payment provider.
Forms show inline field errors on blur or submit and use a centered dialog for
validation and API feedback. Phone fields accept South African mobile numbers
in local (`082 123 4567`) or international (`+27 82 123 4567`) format.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
