import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DrawerNavigator, StackNavigator  } from 'react-navigation';
import { Icon } from 'react-native-elements';

// Import components
import HomeScreen from './components/HomeScreen';
import AddExpense from './components/AddExpense';
import AddRegular from './components/AddRegular';
import EditCategory from './components/EditCategory';
import EditExpense from './components/EditExpense';
import PreviousMonth from './components/PreviousMonth';

const SpendTrackr = DrawerNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      drawerLabel: 'Home',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='home' />
      ),
    },
  },
  Previous: {
    screen: PreviousMonth,
    navigationOptions: {
      drawerLabel: 'Previous Months',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='date-range' />
      ),
    },
  },
  AddExpense: {
    screen: AddExpense,
    navigationOptions: {
      drawerLabel: 'Add New Expense',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='add' />
      ),
    },
  },
  ViewRegular: {
    screen: AddRegular,
    navigationOptions: {
      drawerLabel: 'View Regular Expenses',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='format-list-bulleted' />
      ),
    },
  },
  EditCategory: {
    screen: EditCategory,
    navigationOptions: {
      drawerLabel: 'Edit Categories',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='edit' />
      ),
    },
  },
  EditExpense: {
    screen: EditExpense,
    navigationOptions: {
      drawerLabel: () => null
    }
  },
});

export default class App extends React.Component {
  render() {
    return <SpendTrackr />;
  }
};