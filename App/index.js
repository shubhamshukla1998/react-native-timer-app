import React, { Component } from "react";
import { Audio } from "expo-av";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Picker,
  Platform,
  Vibration,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const wheelPickerData = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07121B",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 10,
    borderColor: "#08F7FE",
    width: screen.width / 2,
    height: screen.width / 2,
    borderRadius: screen.width / 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    fontSize: 45,
    color: "#08F7FE",
  },
  timerText: {
    color: "#fff",
    fontSize: 90,
  },
  buttonStop: {
    borderColor: "#FF851B",
  },
  buttonTextStop: {
    color: "#FF851B",
  },
  picker: {
    width: 40,
    ...Platform.select({
      android: {
        color: "#fff",
        backgroundColor: "#07121B",
        marginLeft: 10,
      },
    }),
  },
  pickerItem: {
    color: "#fff",
    fontSize: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

const formatNumber = (number) => `0${number}`.slice(-2);

const getRemainingTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  return { minutes: formatNumber(minutes), seconds: formatNumber(seconds) };
};

const createArray = (length) => {
  const arr = [];
  let i = 0;
  while (i <= length) {
    arr.push(i.toString());
    i++;
  }
  return arr;
};

const AVAILABLE_MINUTES = createArray(10);
const AVAILABLE_SECONDS = createArray(60);

export default class App extends Component {
  state = {
    remainingSeconds: 10,
    isRunning: false,
    selectedMinutes: "0",
    selectedSeconds: "10",
  };

  interval = null;

  async _playsound() {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require("../assets/sounds/inflicted.mp3"));
      await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
      console.log("error", error);
    }
  }

  componentDidUpdate(prevProp, prevState) {
    if (this.state.remainingSeconds == -1 && prevState.remainingSeconds != -1) {
      Vibration.vibrate(1000);
      this._playsound();
      this.stop();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  start = () => {
    this.setState((state) => ({
      remainingSeconds:
        parseInt(state.selectedMinutes) * 60 + parseInt(state.selectedSeconds),
      isRunning: true,
    }));

    this.interval = setInterval(() => {
      this.setState((state) => ({
        remainingSeconds: state.remainingSeconds - 1,
        isRunning: true,
      }));
    }, 1000);
  };

  stop = () => {
    clearInterval(this.interval);
    this.interval = null;

    this.setState({
      remainingSeconds: 10,
      isRunning: false,
    });
  };

  renderPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={this.state.selectedMinutes}
        onValueChange={(itemValue) => {
          this.setState({
            selectedMinutes: itemValue,
          });
        }}
        mode="dropdown">
        {AVAILABLE_MINUTES.map((value) => (
          <Picker.Item key={value} label={value} value={value} />
        ))}
      </Picker>
      <Text style={styles.pickerItem}>minutes</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={this.state.selectedSeconds}
        onValueChange={(itemValue) => {
          this.setState({
            selectedSeconds: itemValue,
          });
        }}
        mode="dropdown">
        {AVAILABLE_SECONDS.map((value) => (
          <Picker.Item key={value} label={value} value={value} />
        ))}
      </Picker>
      <Text style={styles.pickerItem}>seconds</Text>
    </View>
  );

  render() {
    const { minutes, seconds } = getRemainingTime(this.state.remainingSeconds);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.state.isRunning ? (
          <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>
        ) : (
          this.renderPicker()
        )}

        {this.state.isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonStop]}
            onPress={this.stop}>
            <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={this.start}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
