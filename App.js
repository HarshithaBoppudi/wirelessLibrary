import * as React from 'react';
import { View, StyleSheet, Button,TextInput,Text,TouchableOpacity,Image } from 'react-native';
import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/TransactionScreen'
import {createBottomTabNavigator} from 'react-navigation-tabs'
import {createAppContainer,createSwitchNavigator} from 'react-navigation'
import LoginScreen from './screens/LoginScreen'

export default class App extends React.Component {

render(){
  return(
   
    <AppContainer/>
    
  )
}
}

const tabNavigator=createBottomTabNavigator({
  TransactionScreen:{screen:TransactionScreen},
  SearchScreen:{screen:SearchScreen}
},
{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:()=>{
      const routeName=navigation.state.routeName
      if(routeName==='TransactionScreen'){
        return(
          <Image
          source={require('./assets/book1.png')}
          style={{width:40,height:40}}
          />
        )
      }
      else if(routeName==='SearchScreen'){
        return(
          <Image
          source={require('./assets/book2.jpg')}
          style={{width:40,height:40}}
          />
        )
      }
    }
  })
}
)
const switchNavigator=createSwitchNavigator({
  LoginScreen:{screen:LoginScreen},
  TabNavigator:{screen:tabNavigator}
})

const AppContainer=createAppContainer(switchNavigator)
