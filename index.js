Markers = new Mongo.Collection('markers');



Meteor.startup(function(){
  if(Meteor.isClient) {  
      console.log('hello');
    GoogleMaps.load({
    key: 'AIzaSyD81kt-LoD3_Vqyqhd1yw9YlHq8J3SHpEg'
    });
  }
});

if (Meteor.isClient) {
  
  Template.map.events({
    'click .getnumber': function () {
      if (Meteor.isCordova) {
      var options = new ContactFindOptions();
options.filter = "";
options.multiple = true;
var fields = ["displayName", "name"];
vm.contacts = navigator.contacts.find(fields, onSuccess, onError, options);

function onSuccess(contacts) {
  console.log(contacts.length + 'contacts');
  for (var i = 0; i < contacts.length; i++) {
    alert("Display Name = " + contacts[i].displayName);
  }
}

function onError(contactError) {
  console.log('onError!');
}
      }
    }
  });
  
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      var markers = {};

      Markers.find().observe({
        added: function (document) {
          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            id: document._id
          });

          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          markers[document._id] = marker;
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 8
        };
      }
    }
  });
}
