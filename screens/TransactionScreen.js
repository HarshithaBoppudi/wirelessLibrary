import * as React from 'react';
import { View, StyleSheet, Button,TextInput,Text,TouchableOpacity,Image,KeyboardAvoidingView, Alert,ToastAndroid } from 'react-native';
import * as  Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config'
import firebase from 'firebase'
import { color } from 'react-native-reanimated';
export default class TransactionScreen extends React.Component {
  constructor(){
    super()
    this.state={
      hasCamaraPermissions:null,
      scanned:false,
      scannedBookID:'',
      scannedStudentID:'',
      button:'normal',
      transactionMessage:''

    }
  }
  getCamaraPermissions=async(id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    //status === "granted" is true when user has granted permission status === "granted" is 
    //false when user has not granted the permission
    this.setState({
      hasCamaraPermissions:status==='granted',
      button:id,
      scanned:false,
      
    })
  }
  checkBookEligibility=async()=>{
    const bookRef=await db.collection('books').where('bookId','==',this.state.scannedBookID).get()
    var transactionType=''
    if(bookRef.docs.length==0){
      transactionType=false
    }
    else{
      bookRef.docs.map((doc)=>{
       var book=doc.data()
       if(book.bookAvailability){
         transactionType='issue'
       }
       else{
         transactionType='return'
       }
      })
    }
    return transactionType
  }
  checkStudentEligibleForBookIssue=async()=>{
    const studentRef=await db.collection('students').where('studentId','==',this.state.scannedStudentID).get()
    var isStudentEligible=''
    if(studentRef.docs.length==0){

      this.setState({
        scannedBookID:'',
        scannedStudentID:''
      })
      isStudentEligible=false
      alert('student does not avilable in the database')
    }
    else{
      studentRef.docs.map((doc)=>{
        var student=doc.data()
        if(student.noOfBooksIssued<2){
          isStudentEligible=true

        }
        else{
          isStudentEligible=false
          alert('this student had already taken two books')
          this.setState({
            scannedStudentID:'',
            scannedBookID:''
          })
        }


      })

    }
    return isStudentEligible
     
  }
  checkStudentEligibleForBookReturn=async()=>{
    const transactionRef=await db.collection('transaction').where('bookId','==',this.state.scannedBookID)
    .limit(1).get()
    var isStudentEligible=''
    transactionRef.docs.map((doc)=>{
      var lastTransaction=doc.data()
      if(lastTransaction.studentId==this.state.scannedStudentID){
        isStudentEligible=true
      }
      else{
        isStudentEligible=false
        alert('this student did not take this book')
        this.setState({
          scannedBookID:'',
          scannedStudentID:''
        })
      }
    })
    return isStudentEligible
  }
  handleTransaction=async()=>{
    var transactionType=await this. checkBookEligibility()
    if(!transactionType){
      alert('the book does not exist in the database')
      this.setState({
        scannedStudentID:'',
        scannedBookID:''
      })
    }
     else if(transactionType==='issue'){
       var isStudentEligible=await this.checkStudentEligibleForBookIssue()
       if(isStudentEligible){
         this.initiateBookIssue()
         alert('book issued to the student')
       }
      
     }
     else{
       var isStudentEligible=await this.checkStudentEligibleForBookReturn()
       if(isStudentEligible){
         this.initiateBookReturn()
         alert('book is returned successfully')
       }  
    }
     
  }
  initiateBookIssue=async()=>{
    db.collection('transaction').add({
      studentId:this.state.scannedStudentID,
      bookId:this.state.scannedBookID,
      transactionType:'issue',
      date:firebase.firestore.Timestamp.now().toDate()
    })
    db.collection('books').doc(this.state.scannedBookID).update({
      bookAvailability:false
    })

    db.collection('students').doc(this.state.scannedStudentID).update({
      noOfBooksIssued:firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedBookID:'',
      scannedStudentID:'',
    })
     //ToastAndroid.show('book has been successfully issued',ToastAndroid.LONG)
    // return alert('book has been successfully issued')
  }

  initiateBookReturn=async()=>{
    db.collection('transaction').add({
      studentId:this.state.scannedStudentID,
      bookId:this.state.scannedBookID,
      transactionType:'return',
      date:firebase.firestore.Timestamp.now().toDate()
    })
    db.collection('books').doc(this.state.scannedBookID).update({
      bookAvailability:true
    })

    db.collection('students').doc(this.state.scannedStudentID).update({
      noOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedBookID:'',
      scannedStudentID:'',
    })
    // ToastAndroid.show('book has been successfully returned',ToastAndroid.LONG)
   // return alert('book has been successfully returned')
  }
  handleBarCodeScanner=async({type,data})=>{
    const button=this.state.button
    if(button==='bookID'){

    
this.setState({
  scannedBookID:data,
  scanned:true,
  button:'normal'
})}
else if(button==='studentID'){
  this.setState({
    scannedStudentID:data,
    scanned:true,
    button:'normal'
  })
}
  }
render(){
  const hasCamaraPermissions=this.state.hasCamaraPermissions
  const scanned=this.state.scanned
  const button=this.state.button
  if(button!=='normal'&&hasCamaraPermissions){
    return(
      <BarCodeScanner
      onBarCodeScanned={scanned?undefined:this.handleBarCodeScanner}
      style={StyleSheet.absoluteFillObject}
      />
    )
  }
  else if(button==='normal'){
    return(
      <KeyboardAvoidingView  style={styles.container} behavior='padding' enabled>

      <View>
        <Image
        source={require('../assets/book.png')}
        style={{width:200,height:200,alignSelf:'center'}}
        
        />
  
        
        <Text style={{fontSize:30,textAlign:'center'}}>Willy</Text>
        <View style={styles.inputView}>
        <TextInput style={styles.inputBox}
        placeholder='BookID'
        value={this.state.scannedBookID}
        onChangeText={(text)=>{
            this.setState({
              scannedBookID:text
            })
        }}
        />
         <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCamaraPermissions('bookID')}}>
          <Text>Scan Book ID</Text>

        </TouchableOpacity>
        </View>
        <View style={styles.inputView}>
        <TextInput style={styles.inputBox}
        placeholder='StudentID'
        value={this.state.scannedStudentID}
        onChangeText={(text)=>{
          this.setState({
            scannedStudentID:text
          })
      }}
        />
         <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCamaraPermissions('studentID')}}>
          <Text>Scan student ID</Text>
          
        </TouchableOpacity>
        
        </View>
        <Text>{this.state.transactionMessage}</Text>
        <TouchableOpacity  style={styles.submitButton}
         onPress={async()=>{
          var transactionMessage=await this.handleTransaction()
         }}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>


      </View>
      </KeyboardAvoidingView>

    )
  }
 
}

}
const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  displayText:{
    fontSize:15,
    textDecorationLine:'underline'
  },
  scanButton:{
    backgroundColor:'pink',
    padding:10,
    margin:10,
    marginTop:-2
  },
  inputBox:{
    height:40,
    width:200,
    borderRadius:5,
    borderWidth:1
  },
  inputView:{
    flexDirection:'row',
    margin:20
  },
  submitButton:{
    height:50,
    width:100,
    backgroundColor:'yellow',
    marginTop:20,
    alignSelf:'center'
  },
  submitButtonText:{
    fontSize:20,
    fontWeight:'bold',
    padding:10,
    textAlign:'center',
    color:'blue',
    alignSelf:'center'
  }
})