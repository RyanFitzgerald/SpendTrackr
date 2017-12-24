import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
 
export default class DatePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theDate: moment().format('MMMM D, YYYY'),
      isDateTimePickerVisible: false,
    };
  }
 
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
 
  _handleDatePicked = (date) => {
    this.setState({
      theDate: moment(date).format('MMMM D, YYYY')
    })
    this.props.setDate(date);
    this._hideDateTimePicker();
  };
 
  render () {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={this._showDateTimePicker}>
          <Text style={styles.text} ref={input => this.dateDisplay}>{this.state.theDate}</Text>
        </TouchableOpacity>
        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    height: 50,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  }
});