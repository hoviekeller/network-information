var background = (function () {
  var tmp = {};
  var context = document.documentElement.getAttribute("context");
  if (context === "webapp") {
    return {
      "send": function () {},
      "receive": function (callback) {}
    }
  } else {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      for (var id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-interface") {
            if (request.method === id) tmp[id](request.data);
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {tmp[id] = callback},
      "send": function (id, data) {chrome.runtime.sendMessage({"path": "interface-to-background", "method": id, "data": data})}
    }
  }
})();

var config = {
  "connection": null,
  "gauge": {
    "object": null,
    "element": null,
    "min": {"value": 0},
    "max": {"value": 100},
    "animation": {"speed": 32}
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      var context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            chrome.runtime.connect({
              "name": config.port.name
            });
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "load": function () {
    var reload = document.querySelector("#reload");
    var support = document.querySelector("#support");
    var donation = document.querySelector("#donation");
    var moreinfo = document.querySelector(".moreinfo");
    /*  */
    config.gauge.element = document.querySelector(".gauge");
    config.gauge.object = new Gauge(config.gauge.element).setOptions(config.downlink.options);
    config.gauge.object.animationSpeed = config.gauge.animation.speed;
    config.gauge.object.minValue = config.gauge.min.value;
    config.gauge.object.maxValue = config.gauge.max.value;
    /*  */
    config.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (config.connection) config.connection.addEventListener("change", config.app.start);
    /*  */
    reload.addEventListener("click", function () {document.location.reload()});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    moreinfo.addEventListener("click", function () {background.send("moreinfo")});
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          var tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "downlink": {
    "current": 0,
    "options": {
      "angle": -0.175,
      "lineWidth": 0.2,
      "pointer": {
        "length": 0.4,
        "color": "#777777",
        "strokeWidth": 0.035
      },
      "colorStop": "#4285f4",
      "highDpiSupport": true,
      "colorStart": "#FFFFFF",
      "generateGradient": true,
      "renderTicks": {
        "divisions": 8,
        "divWidth": 0.5,
        "divLength": 0.50,
        "divColor": "#FFFFFF"
      },
      "percentColors": [
        [12.5 * 0 / 100, "#999999"],
        [12.5 * 1 / 100, "#f902f2"],
        [12.5 * 2 / 100, "#9002f9"],
        [12.5 * 3 / 100, "#6302f9"],
        [12.5 * 4 / 100, "#0281f9"],
        [12.5 * 5 / 100, "#3ec702"],
        [12.5 * 6 / 100, "#f9cc02"],
        [12.5 * 7 / 100, "#f99f02"],
        [12.5 * 8 / 100, "#f90211"]
      ],
    }
  },
  "app": {
    "update": function (e) {
      var label = document.querySelector(".label");
      var info = document.querySelector(".label .info");
      var downlink = document.querySelector(".label .downlink");
      /*  */
      info.style.top = e.outerWidth < 450 ? "99%" : "45%";
      info.style.left = e.outerWidth < 450 ? "0" : "-82%";
      downlink.style.top = e.outerWidth < 450 ? "85%" : "90%";
      info.style.transform = e.outerWidth < 450 ? "none" : "rotate(-90deg)";
      label.style.marginLeft = e.outerWidth < 450 ? (((e.outerWidth - 300) / 2) - 15) + "px" : "auto";
    },
    "start": function () {
      var wifion = document.querySelector(".wifi-on");
      var wifioff = document.querySelector(".wifi-off");
      /*  */
      if (config.connection) {
        const metric = config.connection.downlink;
        var numerics = [0, 1, 5, 10, 20, 30, 50, 75, 100];
        /*  */
        for (var i = 0; i < 8; i++) {
          if (metric > numerics[i] && metric <= numerics[i + 1]) {
            config.downlink.current = (i + (metric - numerics[i]) / (numerics[i + 1] - numerics[i])) * (100 / 8);
            document.querySelector(".label .downlink").textContent = metric + "Mb/s";
            config.gauge.object.set(config.downlink.current);
            break;
          }
        }
      } else {
        config.connection = {};
        config.gauge.object.set(config.downlink.current);
        document.querySelector(".label .downlink").textContent = "N/A";
      }
      /*  */
      wifion.style.display = window.navigator.onLine ? "block" : "none";
      wifioff.style.display = window.navigator.onLine ? "none" : "block";
      /*  */
      document.querySelector(".metrics .type").textContent = "1 • Connection type: " + (config.connection.type ? config.connection.type : "N/A");
      document.querySelector(".metrics .rtt").textContent = "2 • Connection rtt: " + (config.connection.rtt ? config.connection.rtt + "ms" : "N/A");
      document.querySelector(".metrics .saveData").textContent = "3 • Connection saveData: " + (config.connection.saveData ? config.connection.saveData : "N/A");
      document.querySelector(".metrics .downlinkMax").textContent = "4 • Connection downlinkMax: " + (config.connection.downlinkMax ? config.connection.downlinkMax + "Mb/s" : "N/A");
      document.querySelector(".metrics .effectiveType").textContent = "5 • Connection effectiveType: " + (config.connection.effectiveType ? config.connection.effectiveType : "N/A");
      document.querySelector(".metrics .downlink").textContent = "6 • Connection downlink: " + (config.connection.downlink ? config.connection.downlink + "Mb/s" : "N/A");
    }
  }
};

config.port.connect();
window.addEventListener("load", config.load, false);
