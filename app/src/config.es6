/**
 * Created by yarden on 7/3/15.
 */

export const MAP_DEFAULTS =  {
    mapbox: {
      url: "https://a.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={access_token}",
      opt: {
        id:           'yarden.mi9kei3m',
        access_token: 'pk.eyJ1IjoieWFyZGVuIiwiYSI6ImM5NzdkZTdhZTBlOWFmNDlkM2M1MmEyY2M1NjkzOTg3In0.VZytH8boHpDX-J9PaxDjpA'
      }
    },
    center: [39.58, -111.5],
    zoom: 6,
    zipcodes_file: "assets/maps/ut-zipcodes.json"
  };
