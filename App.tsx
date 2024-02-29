import {StyleSheet} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import SignInPage from "./screens/SignInPage";
import SignUpPage from "./screens/SignUpPage";
import PhoneNumberVerification from "./screens/PhoneNumberVerification";
import AwaitEmailVerification from "./screens/AwaitEmailVerification";
import Dashboard from "./screens/Dashboard";
import EnterPassword from "./screens/EnterPassword";
import SignInWithPhone from "./screens/SignInWithPhone";
export type EditorParams = {
  SignUpPage: undefined;
  AwaitEmailVerification: {
    user_email: string;
    user_password: string;
    full_phone: string;
  };
  PhoneNumberVerification: {
    email: string;
    phone: string;
    password: string;
  };
  SignInPage: undefined;
  EnterPassword: {
    email: string;
  };
  SignInWithPhone: {
    confirmation_cred: string;
  };
  Dashboard:
    | {
        current_email: string | null;
      }
    | undefined;
};

const Stack = createNativeStackNavigator<EditorParams>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignInPage">
        <Stack.Screen name="SignUpPage" component={SignUpPage} options={{headerShown: false}} />
        <Stack.Screen name="EnterPassword" component={EnterPassword} options={{headerShown: false}} />
        <Stack.Screen name="AwaitEmailVerification" component={AwaitEmailVerification} options={{headerShown: false}} />
        <Stack.Screen name="PhoneNumberVerification" component={PhoneNumberVerification} options={{headerShown: false}} />

        <Stack.Screen name="SignInWithPhone" component={SignInWithPhone} options={{headerShown: false}} />
        <Stack.Screen name="SignInPage" component={SignInPage} options={{headerShown: false}} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
