import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DrawerNavigator  } from 'react-navigation';
import { Icon } from 'react-native-elements';

// Import components
import HomeScreen from './components/HomeScreen';
import AddExpense from './components/AddExpense';
import AddRegular from './components/AddRegular';
import EditCategory from './components/EditCategory';

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
    screen: HomeScreen,
    navigationOptions: {
      drawerLabel: 'Previous Months',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='date-range' />
      ),
    },
  },
  Stats: {
    screen: HomeScreen,
    navigationOptions: {
      drawerLabel: 'Statistics',
      drawerIcon: ({ tintColor, focused }) => (
        <Icon
        name='insert-chart' />
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
});

export default class App extends React.Component {
  render() {
    return <SpendTrackr />;
  }
};