import React, { useEffect } from 'react';

const SearchBox = ({ map }) => {
  useEffect(() => {
    const input = document.getElementById("pac-input");
    const searchBox = new window.google.maps.places.SearchBox(input);

    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });

      map.fitBounds(bounds);
    });

    return () => {
      // Cleanup
      window.google.maps.event.clearInstanceListeners(searchBox);
    };
  }, [map]);

  return (
    <input
      id="pac-input"
      type="text"
      placeholder="Search for a place..."
      style={{ width: "300px", marginTop: "10px", marginLeft: "10px" }}
    />
  );
};

export default SearchBox;
