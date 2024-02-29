import {View, Text, StyleSheet, ActivityIndicator} from "react-native";
import React, {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

interface awaitEmailVerificationProps {
  route: any;
}

export default function AwaitEmailVerification({route}: awaitEmailVerificationProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const {user_email, user_password, full_phone} = route.params;
  const [is_email_verified, setEmailVerified] = useState(false);
  const [should_continue_loop, setShouldContinueLoop] = useState(true);

  // function that checks if email is verified
  const checkEmailVerification = async () => {
    setLoading(true);
    try {
      // reloads the user's credentials/data
      await auth().currentUser?.reload();

      // assigns the current boolean value of emailVerified to isVerified.
      const is_verified = auth().currentUser?.emailVerified || false;

      setEmailVerified(is_verified);
      // Stops checking email verification if it's already verified.
      if (is_verified) {
        setShouldContinueLoop(false);
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
  };

  // Checks if the email is verified every two seconds and stops when necessary.
  // The loop should continue based on the state of shouldContinueLoop/isVerified.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (should_continue_loop) {
        checkEmailVerification();
      }
    }, 2000);

    // Cleanup function to clear the interval when shouldContinueLoop is false.
    return () => clearInterval(intervalId);
  }, [should_continue_loop]);

  // Use effect for navigating to PhoneNumberVerification when email is verified
  useEffect(() => {
    if (is_email_verified) {
      try {
        // Navigates to PhoneNumberVerification with the user's email and phone.
        navigation.navigate("PhoneNumberVerification", {email: user_email, password: user_password, phone: full_phone});
      } catch (error) {
        console.error("Error navigating to PhoneNumberVerification:", error);
        alert(`An error occurred while navigating. ${error}`);
      } finally {
        setLoading(false);
      }
    }
  }, [is_email_verified, user_email, full_phone, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Waiting for email verification... Check your email.</Text>
      {loading ? <ActivityIndicator size="large" color="#0000f" /> : <View></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginVertical: 4,
    height: 50,
    padding: 10,
    backgroundColor: "#ffffff",
    textAlign: "center",

    elevation: 5,
  },
});
