var config = {};

config.url = {
  "moreinfo": "https://developer.mozilla.org/docs/Web/API/NetworkInformation"
};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};
