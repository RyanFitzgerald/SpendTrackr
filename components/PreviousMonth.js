import React from 'react';
import { StyleSheet, Alert, ScrollView, View, Text, TextInput, Picker, AsyncStorage, ToastAndroid, StatusBar } from 'react-native';
import { Header, Button, Card } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';
import {VictoryPie, VictoryLegend, VictoryLabel} from 'victory-native';
import moment from 'moment';

const pieColours = ['#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#f1c40f', '#e74c3c', '#16a085', '#bdc3c7', '#2980b9', '#7f8c8d'];

const compareDates = (a, b) => {
  if (moment(a.date).isBefore(b.date))
    return 1;
  if (moment(a.date).isAfter(b.date))
    return -1;
  return 0;
};

class PreviousMonth extends React.Component {
  constructor() {
    super();

    // Bind functions
    this.renderList = this.renderList.bind(this);
    this.getExpenses = this.getExpenses.bind(this);
    this.updateExpenses = this.updateExpenses.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getCurrentMonth = this.getCurrentMonth.bind(this);
    this.getTotal = this.getTotal.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    // Set state
    this.state = {
      month: moment().format('MMMM'),
      selectedMonth: moment().format('MMMM'),
      year: moment().format('YYYY'),
      selectedYear: moment().format('YYYY'),
      total: 0,
      expenses: [],
      monthExpenses: [],
      categories: [],
      chartData: [],
      chartLegend: []
    };
  }

  componentDidMount() {
    this.getExpenses();
    this.getCategories();
  }

  async getExpenses() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:expenses');
      if (value !== null) {
        this.setState({ expenses: JSON.parse(value) }, () => {
          this.getCurrentMonth(JSON.parse(value));
        });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  async updateExpenses() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:expenses', JSON.stringify(this.state.expenses));
      this.getCurrentMonth(this.state.expenses);
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  }


  async getCategories() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:categories');
      if (value !== null) {
        this.setState({ categories: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  getCurrentMonth(expenses) {
    const currentMonth = `${this.state.month} ${this.state.year}`;
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = moment(expense.date).format('MMMM YYYY');
      return expenseMonth === currentMonth;
    });

    monthExpenses.sort(compareDates);

    this.setState({ monthExpenses }, () => {
      this.getTotal();
    });
  }

  getTotal() {
    let total = 0;
    this.state.monthExpenses.forEach(expense => {
      total += expense.cost;
    });

    this.setState({ total }, () => {
      this.getChartData();
    });
  }

  getChartData() {
    let chartData = [];
    let chartLegend = [];

    // Get categories
    let categories = [];  
    this.state.monthExpenses.forEach(expense => {
      if (!categories.includes(expense.category)) {
        categories.push(expense.category);
      }
    });

    // Get category totals
    let categoryTotals = [];
    categories.forEach(category => {
      let categoryTotal = { category, 'total': 0 };
      this.state.monthExpenses.forEach(expense => {
        if (expense.category === category) {
          categoryTotal.total += expense.cost;
        }
      });

      if (categoryTotal.total > 0) {
        categoryTotals.push(categoryTotal);
      }
    });

    // Form data
    categoryTotals.forEach((categoryTotal, key) => {
      let percent = (categoryTotal.total/this.state.total)*100;
      let dataEntry = {'x': `${categoryTotal.category} (${percent.toFixed(1)}%)`, 'y': percent};
      let legendEntry = {'name': `${categoryTotal.category} ($${(categoryTotal.total/100).toFixed(2)})`, 'symbol': {'fill': pieColours[key], 'type': 'square'}};
      chartData.push(dataEntry);
      chartLegend.push(legendEntry);
    });

    // Return chartdata
    this.setState({chartData, chartLegend});
  }

  handleSubmit() {
    // Check the year
    if (!this.state.selectedYear.match(/^\d{4}$/)) {
      Alert.alert('Invalid year, digits only (ex: 2017).');
      return;
    }

    this.setState({
      year: this.state.selectedYear,
      month: this.state.selectedMonth
    }, () => {
      this.getCurrentMonth(this.state.expenses)
    });
  }

  // Handle delete
  handleDelete(id) {
    const newExpenses = this.state.expenses.filter(el => el.id !== id);
    ToastAndroid.showWithGravityAndOffset('Successfully deleted expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({ expenses: newExpenses }, () => {
      this.updateExpenses();
    });
  }

  renderList(item, key) {
    const { navigate } = this.props.navigation;
    const swipeSettings = {
      autoClose: true,
      right: [{ 
        text: 'Delete',
        backgroundColor: '#e74c3c',
        onPress: () => this.handleDelete(item.id)
      }],
      left: [{
        text: 'Edit',
        backgroundColor: '#2ecc71',
        onPress: () => navigate('EditExpense', {item})
      }]
    };

    return (
      <Swipeout {...swipeSettings} style={styles.item} key={key}>
        <View style={styles.itemWrapper}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDate}>{item.category} | {moment(item.date).format('YYYY-MM-DD')}</Text>
          </View>
          <View>
            <Text style={styles.itemName}>${(item.cost/100).toFixed(2)}</Text>
          </View>
        </View>
      </Swipeout>
    );
  }

  render() {
    const { navigate } = this.props.navigation;
    const currentDate = moment();
    const years = [currentDate.format('YYYY')];
    for (let i = 1; i < 10; i++) {
      years.push(currentDate.subtract(1, 'years').format('YYYY'));
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
          centerComponent={{ text: 'Previous Months', style: { color: '#fff' } }}
          rightComponent={{ icon: 'home', color: '#fff', onPress: () => navigate('Home') }}
          backgroundColor="#3498db"
          outerContainerStyles={{height: 55}}
        />
        <ScrollView style={{paddingBottom: 20}}>
          <Card title="Select Month and Year" containerStyle={{marginBottom: 20}}>
            <Text style={styles.label}>Month</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.selectedMonth}
              onValueChange={selectedMonth => this.setState({selectedMonth})}
            >
              <Picker.Item label="January" value="January" />
              <Picker.Item label="February" value="February" />
              <Picker.Item label="March" value="March" />
              <Picker.Item label="April" value="April" />
              <Picker.Item label="May" value="May" />
              <Picker.Item label="June" value="June" />
              <Picker.Item label="July" value="July" />
              <Picker.Item label="August" value="August" />
              <Picker.Item label="September" value="September" />
              <Picker.Item label="October" value="October" />
              <Picker.Item label="November" value="November" />
              <Picker.Item label="December" value="December" />
            </Picker>
            <Text style={styles.label}>Year</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.selectedYear}
              onValueChange={selectedYear => this.setState({selectedYear})}
            >
              {years.map((year, key) => <Picker.Item label={year} value={year} key={key} />)}
            </Picker>
            <Button title="View Month" backgroundColor="#3498db" onPress={this.handleSubmit}/>
          </Card>
          <Text style={styles.title}>{this.state.month} {this.state.year}</Text>
          <Text style={styles.subtitle}>${(this.state.total/100).toFixed(2)}</Text>
          <Card containerStyle={styles.chart} pointerEvents="none">
            {this.state.chartData.length > 0 ? (
              <View>
                <VictoryPie 
                  colorScale={pieColours}
                  style={{ labels: { display: '#000' }, chart: {margin: 100} }}
                  animate={false}
                  labelRadius={100}
                  data={this.state.chartData}
                />
                <VictoryLegend x={50} y={0}
                  centerTitle
                  orientation="vertical"
                  style={{labels: {marginBottom: 0 } }}
                  gutter={20}
                  itemsPerRow={5}
                  height={170}
                  labelComponent={<VictoryLabel dy={-25}/>}
                  data={this.state.chartLegend}
                />
              </View>
            ) : (
              <View>
                <Text>No data to display. Start by adding a new expense.</Text>
              </View>
            )}
          </Card>
          <Card title="Expenses" containerStyle={{marginBottom: 20}}>
            {this.state.monthExpenses.map((expense, key) => this.renderList(expense, key))}
          </Card>
        </ScrollView>
     </View> 
    );
  }
};

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
  chart: {
    marginBottom: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#4a5058',
    marginTop: 10,
    marginBottom: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    color: '#4a5058',
    marginTop: -10,
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d6d7da',
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15
  },
  itemName:{
    fontSize: 20
  },
  itemDate:{
    fontSize: 10
  }
});

export default PreviousMonth;

