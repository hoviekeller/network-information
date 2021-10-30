var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    /*  */
  }
};

app.interface.receive("load", function () {app.interface.send("storage")});
app.interface.receive("support", function () {app.tab.open(app.homepage())});
app.interface.receive("moreinfo", function () {app.tab.open(config.url.moreinfo)});
app.interface.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);
