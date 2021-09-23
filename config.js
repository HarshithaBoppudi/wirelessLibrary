import * as firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyDqjQ76b_4gji6-2eAVKyisroz2ShvNsuU",
    authDomain: "willy-4393b.firebaseapp.com",
    projectId: "willy-4393b",
    storageBucket: "willy-4393b.appspot.com",
    messagingSenderId: "309810101510",
    appId: "1:309810101510:web:ef7347c6c235d9831ef287"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig); 
  export default firebase.firestore()