import React, { Component } from 'react';
import { StyleSheet, Alert, View, ScrollView, Text, TextInput, Picker, AsyncStorage, ToastAndroid, ActivityIndicator, StatusBar } from 'react-native';
import { Card, Button, Header } from 'react-native-elements'
import moment from 'moment';
import uuidv1 from 'uuid/v1';

import DatePicker from './DatePicker';

class AddExpense extends Component {
  constructor() {
    super();

    // Bind functions
    this.getExpenses = this.getExpenses.bind(this);
    this.updateExpenses = this.updateExpenses.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.checkInput = this.checkInput.bind(this);
    this.checkCost = this.checkCost.bind(this);
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    // Set state
    this.state = {
      id: false,
      expenseName: '',
      cost: '0.00',
      categoryName: 'Other',
      date: moment(),
      expenses: [],
      categories: [],
    };
  }

  componentDidMount() {
    this.getExpenses();
    this.getCategories();

    // Set initial states
    if(this.props.navigation.state.params) {
      const item = this.props.navigation.state.params.item;
      const id = item.id;
      const expenseName = item.name;
      const cost = (item.cost/100).toFixed(2);
      const categoryName = item.category;
      const date = item.date;
      
      this.setState({ id, expenseName, cost, categoryName, date });
    }
  }

  async getExpenses() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:expenses');
      if (value !== null) {
        this.setState({ expenses: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  async updateExpenses() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:expenses', JSON.stringify(this.state.expenses));
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  }

  async getCategories() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:categories');
      if (value !== null) {
        this.setState({ categories: JSON.parse(value) })
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  checkInput() {
    // Check if all inputs have been filled
    return (
      !this.state.expenseName || this.state.expenseName.length === 0 ||
      !this.state.cost || this.state.cost.length === 0 ||
      !this.state.categoryName || this.state.categoryName.length === 0
    );
  }

  checkCost(cost) {
    // Check that cost contains valid characters
    if (cost.includes(',') || cost.includes(' ') || cost.includes('-')) {
      Alert.alert('Invalid character, only use digits and decimals.');
      return;
    }

    // Update cost state
    this.setState({ cost });
  }

  setDate(date) {
    // Update the date from the datepicker
    this.setState({ date });
  }

  handleSubmit() {
    const { navigate } = this.props.navigation;

    // Check all inputs are filled
    if (this.checkInput()) {
      Alert.alert('All fields must be filled.');
      return;
    }

    // Check if cost is proper format
    if (!(this.state.cost).toString().match(/^\d+(\.\d{2})?$/)) {
      Alert.alert('Invalid Cost Format, please include only numbers and at most 1 decimal (EX: 12.19).');
      return;
    }

    // Store category name and id
    const expenseName = this.state.expenseName;
    const cost = this.state.cost*100;
    const categoryName = this.state.categoryName;
    const date = this.state.date;

    // Update expense
    const newExpenses = this.state.expenses.map(expense => {
      if (expense.id === this.state.id) {
        return {id: this.state.id, 'name': expenseName, 'category': categoryName, cost, date}
      } else {
        return expense;
      }
    });

    // Push toast
    ToastAndroid.showWithGravityAndOffset('Successfully updated expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);

    // Update expenses and navigate to home page
    this.setState({expenses: newExpenses }, () => {
      this.updateExpenses();
      navigate('Home');
    });
  }

  render() {
    const { navigate } = this.props.navigation;

    if (!this.state.id) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <StatusBar
          backgroundColor="#2c709d"
          barStyle="light-content"
          translucent={false}
        />
        <Header
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => navigate('DrawerToggle') }}
          centerComponent={{ text: 'Edit Expense', style: { color: '#fff' } }}
          rightComponent={{ icon: 'home', color: '#fff', onPress: () => navigate('Home') }}
          backgroundColor="#3498db"
          outerContainerStyles={{height: 55}}
        />
        <ScrollView>
          <Card title="Edit Expense" containerStyle={styles.card}>
            <Text style={styles.label}>Expense Name</Text>
            <TextInput
              style={styles.textInput}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. Coffee"
              onChangeText={expenseName => this.setState({expenseName})}
              defaultValue={this.state.expenseName}
            />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. 3.20"
              onChangeText={cost => this.checkCost(cost)}
              defaultValue={this.state.cost}
            />
            <Text style={styles.label}>Date</Text>
            <DatePicker setDate={this.setDate} defaultDate={this.state.date}/>
            <Text style={styles.label}>Category</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.categoryName}
              onValueChange={categoryName => this.setState({categoryName})}
            >
              {this.state.categories.map((category, key) => 
                <Picker.Item label={category.name} value={category.name} key={key} />
              )} 
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <Button title="Update Expense" backgroundColor="#3498db" onPress={this.handleSubmit}/>
          </Card>
        </ScrollView>
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
  },
  textInput: {
    fontSize: 15,
    height: 50,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  picker: {
    height: 50,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  card: {
    marginBottom: 20
  },
  regular: {
    marginBottom: 5
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  }
});

export default AddExpense;
