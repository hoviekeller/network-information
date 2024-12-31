var background = (function () {
  let tmp = {};
  let context = document.documentElement.getAttribute("context");
  if (context === "webapp") {
    return {
      "send": function () {},
      "receive": function (callback) {}
    }
  } else {
    chrome.runtime.onMessage.addListener(function (request) {
      for (let id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-interface") {
            if (request.method === id) {
              tmp[id](request.data);
            }
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {
        tmp[id] = callback;
      },
      "send": function (id, data) {
        chrome.runtime.sendMessage({
          "method": id, 
          "data": data,
          "path": "interface-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
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
    "animation": {"speed": 32},
    //
    set tickscolor (val) {config.storage.write("tickscolor", val)},
    set strokecolor (val) {config.storage.write("strokecolor", val)},
    set currentcolor (val) {config.storage.write("currentcolor", val)},
    set numberscolor (val) {config.storage.write("numberscolor", val)},
    set pointercolor (val) {config.storage.write("pointercolor", val)},
    set spectrumcolor (val) {config.storage.write("spectrumcolor", val)},
    get tickscolor () {return config.storage.read("tickscolor") !== undefined ? config.storage.read("tickscolor") : "#ffffff"},
    get strokecolor () {return config.storage.read("strokecolor") !== undefined ? config.storage.read("strokecolor") : "#e0e0e0"},
    get spectrumcolor () {return config.storage.read("spectrumcolor") !== undefined ? config.storage.read("spectrumcolor") : true},
    get currentcolor () {return config.storage.read("currentcolor") !== undefined ? config.storage.read("currentcolor") : "#9f37ff"},
    get numberscolor () {return config.storage.read("numberscolor") !== undefined ? config.storage.read("numberscolor") : "#555555"},
    get pointercolor () {return config.storage.read("pointercolor") !== undefined ? config.storage.read("pointercolor") : "#555555"},
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
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
          let tmp = {};
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
      "fontSize": 40,
      "angle": -0.175,
      "lineWidth": 0.2,
      "pointer": {
        "length": 0.4,
        "color": "#555555",
        "strokeWidth": 0.035
      },
      "highDpiSupport": true,
      "strokeColor": "#e0e0e0",
      "generateGradient": false,
      "renderTicks": {
        "divisions": 8,
        "divWidth": 0.50,
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
      "staticLabels": {
        "color": "#55555500",
        "font": "10px Times",
        "labels": [
          12.5 * 0,
          12.5 * 1,
          12.5 * 2,
          12.5 * 3,
          12.5 * 4,
          12.5 * 5,
          12.5 * 6,
          12.5 * 7,
          12.5 * 8
        ]
      }
    }
  },
  "load": function () {
    const reload = document.querySelector("#reload");
    const support = document.querySelector("#support");
    const donation = document.querySelector("#donation");
    const moreinfo = document.querySelector(".moreinfo");
    const tickscolor = document.querySelector("#tickscolor");
    const strokecolor = document.querySelector("#strokecolor");
    const currentcolor = document.querySelector("#currentcolor");
    const numberscolor = document.querySelector("#numberscolor");
    const pointercolor = document.querySelector("#pointercolor");
    const spectrumcolor = document.querySelector("#spectrumcolor");
    /*  */
    config.gauge.element = document.querySelector(".gauge");
    config.gauge.object = new Gauge(config.gauge.element);
    /*  */
    config.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (config.connection) {
      config.connection.addEventListener("change", config.app.start);
    }
    /*  */
    spectrumcolor.addEventListener("change", function (e) {
      config.gauge.spectrumcolor = e.target.checked;
      config.app.start();
    });
    /*  */
    currentcolor.addEventListener("input", function (e) {
      config.gauge.currentcolor = e.target.value;
      config.app.start();
    });
    /*  */
    tickscolor.addEventListener("input", function (e) {
      config.gauge.tickscolor = e.target.value;
      config.app.start();
    });
    /*  */
    numberscolor.addEventListener("input", function (e) {
      config.gauge.numberscolor = e.target.value;
      config.app.start();
    });
    /*  */
    strokecolor.addEventListener("input", function (e) {
      config.gauge.strokecolor = e.target.value;
      config.app.start();
    });
    /*  */
    pointercolor.addEventListener("input", function (e) {
      config.gauge.pointercolor = e.target.value;
      config.app.start();
    });
    /*  */
    reload.addEventListener("click", function () {document.location.reload()});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    moreinfo.addEventListener("click", function () {background.send("moreinfo")});
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "app": {
    "update": function (e) {
      const label = document.querySelector(".label");
      const info = document.querySelector(".label .info");
      const downlink = document.querySelector(".label .downlink");
      /*  */
      info.style.top = e.outerWidth < 450 ? "99%" : "45%";
      info.style.left = e.outerWidth < 450 ? "0" : "-82%";
      downlink.style.top = e.outerWidth < 450 ? "85%" : "90%";
      info.style.transform = e.outerWidth < 450 ? "none" : "rotate(-90deg)";
      label.style.marginLeft = e.outerWidth < 450 ? (((e.outerWidth - 300) / 2) - 15) + "px" : "auto";
    },
    "start": function () {
      const wifion = document.querySelector(".wifi-on");
      const wifioff = document.querySelector(".wifi-off");
      const downlink = document.querySelector(".label .downlink");
      /*  */
      if (config.connection) {
        const metric = config.connection.downlink;
        const numerics = [0, 1, 5, 10, 20, 30, 50, 75, 100];
        /*  */
        for (let i = 0; i < 8; i++) {
          if (metric >= numerics[i] && metric <= numerics[i + 1]) {
            config.downlink.current = (i + (metric - numerics[i]) / (numerics[i + 1] - numerics[i])) * (100 / 8);
            config.gauge.object.set(config.downlink.current);
            downlink.textContent = metric + "Mb/s";
            break;
          }
        }
      } else {
        config.connection = {};
        downlink.textContent = "N/A";
        config.gauge.object.set(config.downlink.current);
      }
      /*  */
      tickscolor.value = config.gauge.tickscolor;
      strokecolor.value = config.gauge.strokecolor;
      numberscolor.value = config.gauge.numberscolor;
      currentcolor.value = config.gauge.currentcolor;
      pointercolor.value = config.gauge.pointercolor;
      spectrumcolor.checked = config.gauge.spectrumcolor;
      config.downlink.options.strokeColor = config.gauge.strokecolor;
      config.downlink.options.pointer.color = config.gauge.pointercolor;
      config.downlink.options.renderTicks.divColor = config.gauge.tickscolor;
      document.documentElement.style.setProperty("--numbers-color", config.gauge.numberscolor);
      currentcolor.parentNode.style.display = config.gauge.spectrumcolor ? "none" : "table-cell";
      config.downlink.options.percentColors = config.methods.generate.colors(config.gauge.spectrumcolor);
      /*  */
      config.gauge.object.animationSpeed = config.gauge.animation.speed;
      config.gauge.object.minValue = config.gauge.min.value;
      config.gauge.object.maxValue = config.gauge.max.value;
      config.gauge.object.setOptions(config.downlink.options);
      config.gauge.object.update(true);
      /*  */
      const fontcolor = config.gauge.object.getColorForPercentage(config.downlink.current / 100);
      if (fontcolor) {
        downlink.style.color = fontcolor;
        wifion.querySelector("svg").style.fill = fontcolor;
        wifioff.querySelector("svg").style.fill = fontcolor;
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
  },
  "methods": {
    "hue": {
      "to": {
        "rgb": function (p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          /*  */
          return p;
        }
      }
    },
    "hls": {
      "to": {
        "hex": function (h, s, l) {
          h = h / 360;
          s = s / 100;
          l = l / 100;
          /*  */
          let r, g, b;
          if (s === 0) {
            r = g = b = l;
          } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            /*  */
            r = config.methods.hue.to.rgb(p, q, h + 1 / 3);
            g = config.methods.hue.to.rgb(p, q, h);
            b = config.methods.hue.to.rgb(p, q, h - 1 / 3);
          }
          /*  */
          const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
      }
    },
    "adjust": {
      "color": {
        "brightness": function (color, factor) {
          const num = parseInt(color.replace('#', ''), 16);
          let r = (num >> 16) & 0xff;
          let g = (num >> 8) & 0xff;
          let b = num & 0xff;
          /*  */
          if (factor < 0) {
            r = Math.round(r * (1 + factor));
            g = Math.round(g * (1 + factor));
            b = Math.round(b * (1 + factor));
          } else {
            r = Math.round(r + (255 - r) * factor);
            g = Math.round(g + (255 - g) * factor);
            b = Math.round(b + (255 - b) * factor);
          }
          /*  */
          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
          /*  */
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
      }
    },
    "generate": {
      "spectrum": {
        "color": function (index, totalSteps) {
          const hueEnd = 0;
          const hueStart = 270;
          const hue = hueStart + ((hueEnd - hueStart) * (index - 1)) / (totalSteps - 1);
          /*  */
          return config.methods.hls.to.hex(hue, 100, 50);
        }
      },
      "colors": function (spectrum) {
        const total = 8;
        const colors = [];
        /*  */
        for (let i = 0; i <= total; i++) {
          if (i === 0) {
            colors.push([12.5 * i / 100, "#d1d1d1"]);
          } else {
            if (spectrum) {
              const spectrumColor = config.methods.generate.spectrum.color(i, total);
              colors.push([12.5 * i / 100, spectrumColor]);
            } else {
              if (i === 1) {
                colors.push([12.5 * i / 100, config.gauge.currentcolor]);
              } else {
                const darknessFactor = -1 * ((i - 1) / (total - 1));
                const colorVariation = config.methods.adjust.color.brightness(config.gauge.currentcolor, darknessFactor);
                colors.push([12.5 * i / 100, colorVariation]);
              }
            }
          }
        }
        /*  */
        return colors;
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
