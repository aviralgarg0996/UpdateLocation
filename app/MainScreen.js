//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet,TouchableOpacity ,Image,TextInput,Button} from 'react-native';
import MapView from 'react-native-maps';
import firebase from "react-native-firebase";
import axios from "axios";
// create a component
export default class MainSCreen extends Component {
  state={
    latitude:"",
    longitude:"",
    region: {
      latitude:28.638774,
      longitude:77.366464,
      latitudeDelta: 0.02,
      longitudeDelta: 0.0421,
    },
  }
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
       (position) => {
         console.log("wokeeey");
         console.log(position);
         this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
           error: null,
         });
       },
       (error) => this.setState({ error: error.message }),
       { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
     );
     navigator.geolocation.watchPosition((position)=>{
       console.log("watch position",position)
      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
       });
       var db = firebase.firestore();
       firebase.firestore().doc("users/Maps").set({
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       })
       .then(function(docRef) {
          console.log("Document written with ID: ");
       })
       .catch(function(error) {
          console.log("Error adding document: ", error);
       });
     }, ()=>{
       console.log("Error in watch")
     }, {enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0});
   }
   onRegionChange(region) {
   ()=> this.setState({ region });
  }
    render() {
        return (
            <View style={styles.container}>
            <TextInput style={{width:300}}
value={this.state.address}
onChangeText={(text) => this.setState({address:text})}
placeholder={"Enter your Address here"}
/>
<Button
title="Search Address Location"
onPress={()=>{
  axios({
    method: "get",
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.address}&key=${this.state.key}`
  }).then(response => {
    console.log("response",response)
    let region= {
      latitude:response.data.results[0].geometry.location.lat,
      longitude:response.data.results[0].geometry.location.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.0421,
    }
    this.setState({
      latitude:response.data.results[0].geometry.location.lat,
      longitude:response.data.results[0].geometry.location.lng,
      region:region
    })
}).catch(error => {
  console.log("Error");
  alert(error)
})

}}
/>

        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
        >
          {!!this.state.latitude && !!this.state.longitude && 
          <MapView.Marker
          onDrag={() => console.log('onDrag', arguments)}
          onDragStart={() => console.log('onDragStart', arguments)}
          onDragEnd={(position)=>{
            var db = firebase.firestore();
            firebase.firestore().doc("users/Maps").set({
                latitude:position.nativeEvent.coordinate.latitude,
                longitude:position.nativeEvent.coordinate.longitude
            })
            .then(function(docRef) {
               console.log("Document written with ID: ");
            })
            .catch(function(error) {
               console.log("Error adding document: ", error);
            });
            this.setState({
  latitude:position.nativeEvent.coordinate.latitude,
  longitude:position.nativeEvent.coordinate.longitude,
})
          }
          }
          draggable
         coordinate={{"latitude":this.state.latitude,
         "longitude":this.state.longitude}}
         title={"Current Location Of Vendor"}
       />}
        </MapView>
        <Button
         title="Set Origin"
         onPress={()=>{
            var db = firebase.firestore();
            firebase.firestore().doc("users/Maps").set({
                latitude:this.state.latitude,
                longitude:this.state.longitude
            })
            .then(function(docRef) {
               console.log("Document written with ID: ");
            })
            .catch(function(error) {
               console.log("Error adding document: ", error);
            });
         }}
        />
      </View>
          
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
    
    },
    map: {
      ...StyleSheet.absoluteFillObject,
      top: 80,
      left:0,
      right:0,
      bottom:0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
});

