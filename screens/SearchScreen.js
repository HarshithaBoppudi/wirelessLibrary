import * as React from 'react';
import { View, StyleSheet, Button,TextInput,Text,TouchableOpacity,Image,FlatList } from 'react-native';
import {ScrollView} from 'react-native-gesture-handler'
import db from '../config'
export default class SearchScreen extends React.Component {
  constructor(){
    super()
    this.state={
      allTransactions:[],
      search:'',
      lastVisibleTransaction:null
    }
  }
  componentDidMount=async()=>{
    const transactions=await db.collection('transaction').limit(10).get()
    transactions.docs.map((doc)=>{
        this.setState({
          allTransactions:[],
          lastVisibleTransaction:doc
        })
    })
  }
searchTransaction=async(text)=>{
  
var enteredText=text.split('')
console.log(enteredText)
console.log(enteredText[0].toUpperCase())
if(enteredText[0].toUpperCase()==='B'){
  const transactions= await db.collection('transaction').where('bookId','==',text).get()
  transactions.docs.map((doc)=>{
  this.setState({
    allTransactions:[...this.state.allTransactions,doc.data()],
    lastVisibleTransaction:doc
  })
  })
}
else if(enteredText[0].toUpperCase()==='S'){
  const transactions= await db.collection('transaction').where('studentId','==',text).get()
  transactions.docs.map((doc)=>{
  this.setState({
    allTransactions:[...this.state.allTransactions,doc.data()],
    lastVisibleTransaction:doc
  })
  })
}
}
fetchMoreTransactions=async()=>{
  var text=this.state.search.toUpperCase()
  var enteredText=text.split()
  if(enteredText[0].toUpperCase()==='B'){
    const transactions= await db.collection('transaction').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    transactions.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()],
      lastVisibleTransaction:doc
    })
    })
  }
  else if(enteredText[0].toUpperCase()==='S'){
    const transactions= await db.collection('transaction').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    transactions.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()],
      lastVisibleTransaction:doc
    })
    })
  }
  
}
  
render(){
  return(
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput style={styles.bar}
        placeholder='enter book id or student id'
        onChangeText={(text)=>{
           this.setState({
             search:text
           })
        }}
        
        />
        <TouchableOpacity style={styles.searchButton} onPress={()=>{
          this.searchTransaction(this.state.search)
        }}>
               <Text>Search</Text>
        </TouchableOpacity>

      </View>
       <FlatList
       data={this.state.allTransactions}
       renderItem={({item})=>(
           <View style={{borderBottomWidth:2}}>
                 <Text>
                   {'BookID'+item.bookId}
                 </Text>
                 <Text>
                   {'StudentID'+item.studentId}
                 </Text>
                 <Text>
                   {'transaction Type'+item.transactionType}
                 </Text>
                 <Text>
                   {'Date'+item.date}
                 </Text>
           </View>
       )}
       keyExtractor={(item,index)=>index.toString()}
       onEndReached={this.fetchMoreTransactions}
       onEndReachedThreshold={0.7}
       />
    
    </View>
  )

}

}
const styles=StyleSheet.create({
  container:{
    flex:1,
    marginTop:20
  },
  searchBar:{
      flexDirection:'row',
      height:40,
      borderWidth:0.5,
      alignItems:'center',
      
  },
  bar:{
    alignItems:'center',
    borderWidth:2,
    height:40,
    width:300,
    paddingLeft:10
  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'

  }
})